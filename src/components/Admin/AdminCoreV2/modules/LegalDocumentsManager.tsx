import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Scale, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

interface LegalDocumentsManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const LegalDocumentsManager: React.FC<LegalDocumentsManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['admin-legal-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: violations } = useQuery({
    queryKey: ['admin-constitutional-violations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('constitutional_violations')
        .select('*')
        .eq('resolution_status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleProcessDocument = async (documentId: string) => {
    const { error } = await supabase.rpc('process_legal_document', {
      p_document_id: documentId,
      p_processing_type: 'constitutional_review'
    });
    
    if (!error) {
      logActivity('legal_document_processed', { document_id: documentId });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Scale className="h-6 w-6 mr-2 text-blue-600" />
          Legal Documents Management
        </h2>
        <p className="text-muted-foreground">Monitor legal documents and constitutional compliance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{documents?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {documents?.filter(d => d.status === 'passed').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Passed Laws</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{violations?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Violations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Scale className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {documents?.filter(d => d.status === 'pending').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Legal Documents</CardTitle>
            <CardDescription>Review and manage legal documents</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading documents...</div>
            ) : documents?.length ? (
              <div className="space-y-4">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{doc.document_title}</h3>
                      <p className="text-sm text-muted-foreground">{doc.document_type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={doc.status === 'passed' ? 'default' : 'secondary'}>
                        {doc.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleProcessDocument(doc.id)}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No legal documents found</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Constitutional Violations</CardTitle>
            <CardDescription>Monitor constitutional compliance issues</CardDescription>
          </CardHeader>
          <CardContent>
            {violations?.length ? (
              <div className="space-y-4">
                {violations.slice(0, 5).map((violation) => (
                  <div key={violation.id} className="p-4 border rounded-lg border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="destructive">{violation.severity_level}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Confidence: {Math.round((violation.confidence_score || 0) * 100)}%
                      </span>
                    </div>
                    <h4 className="font-medium">{violation.violation_type}</h4>
                    <p className="text-sm text-muted-foreground">{violation.violation_description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-muted-foreground">No constitutional violations detected</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};