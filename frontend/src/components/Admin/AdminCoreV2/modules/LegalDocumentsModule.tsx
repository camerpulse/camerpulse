import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Scale, Eye, Edit, Trash2, Plus, Download } from 'lucide-react';

interface LegalDocumentsModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
}

export const LegalDocumentsModule: React.FC<LegalDocumentsModuleProps> = ({
  hasPermission,
  logActivity
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch legal documents
  const { data: legalDocuments, isLoading } = useQuery({
    queryKey: ['legal-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: hasPermission('legal_documents')
  });

  // Fetch legal document stats
  const { data: legalStats } = useQuery({
    queryKey: ['legal-stats'],
    queryFn: async () => {
      const { data: total } = await supabase.from('legal_documents').select('id', { count: 'exact' });
      const { data: active } = await supabase.from('legal_documents').select('id', { count: 'exact' }).eq('status', 'active');
      const { data: pending } = await supabase.from('legal_documents').select('id', { count: 'exact' }).eq('status', 'pending');

      return {
        total: total?.length || 0,
        active: active?.length || 0,
        pending: pending?.length || 0,
        archived: (total?.length || 0) - (active?.length || 0) - (pending?.length || 0)
      };
    },
    enabled: hasPermission('legal_documents')
  });

  // Delete document mutation
  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('legal_documents')
        .delete()
        .eq('id', documentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-documents'] });
      queryClient.invalidateQueries({ queryKey: ['legal-stats'] });
      toast({ title: "Document deleted successfully" });
      logActivity('legal_document_deleted', { timestamp: new Date() });
    },
    onError: (error) => {
      toast({ title: "Error deleting document", description: error.message, variant: "destructive" });
    }
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      pending: 'secondary',
      archived: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getDocumentTypeBadge = (type: string) => {
    const colors = {
      law: 'bg-blue-100 text-blue-800',
      regulation: 'bg-green-100 text-green-800',
      decree: 'bg-purple-100 text-purple-800',
      policy: 'bg-orange-100 text-orange-800'
    } as const;
    
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  if (!hasPermission('legal_documents')) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>You don't have permission to access legal documents management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Legal Documents Management"
        description="Manage legal documents, laws, regulations, and policies"
        icon={Scale}
        iconColor="text-purple-600"
        badge={{
          text: "Legal System",
          variant: "secondary"
        }}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['legal-documents'] });
          logActivity('legal_documents_refresh', { timestamp: new Date() });
        }}
      />

      {/* Legal Documents Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Documents"
          value={legalStats?.total?.toString() || '0'}
          icon={FileText}
          description="All legal documents"
        />
        <StatCard
          title="Active Documents"
          value={legalStats?.active?.toString() || '0'}
          icon={Scale}
          badge={{ text: "Active", variant: "default" }}
        />
        <StatCard
          title="Pending Review"
          value={legalStats?.pending?.toString() || '0'}
          icon={Eye}
          badge={{ text: "Pending", variant: "secondary" }}
        />
        <StatCard
          title="Archived"
          value={legalStats?.archived?.toString() || '0'}
          icon={FileText}
          description="Archived documents"
        />
      </div>

      {/* Legal Documents Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">All Documents</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="processing">Processing Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {legalDocuments?.slice(0, 5).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{doc.document_title}</p>
                        <div className="flex gap-2 mt-1">
                          {getDocumentTypeBadge(doc.document_type || 'policy')}
                          {getStatusBadge(doc.status || 'pending')}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Document Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Processing Queue</span>
                    <Badge variant="secondary">2 items</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto-Analysis</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Legal Compliance Check</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">All Legal Documents ({legalDocuments?.length || 0})</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {legalDocuments?.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                    <div className="flex-1">
                      <h3 className="font-medium">{doc.document_title}</h3>
                      <p className="text-sm text-muted-foreground">Legal document</p>
                      <div className="flex gap-2 mt-2">
                        {getDocumentTypeBadge(doc.document_type || 'policy')}
                        {getStatusBadge(doc.status || 'pending')}
                        <Badge variant="outline">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteDocument.mutate(doc.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Legal Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {legalDocuments?.filter(doc => doc.status === 'pending').map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg border-orange-200">
                    <div>
                      <h3 className="font-medium">{doc.document_title}</h3>
                      <p className="text-sm text-muted-foreground">Legal document pending review</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted: {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="default" size="sm">
                        Approve
                      </Button>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Processing Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents currently in processing queue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};