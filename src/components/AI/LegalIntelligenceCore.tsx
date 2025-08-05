import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Scale, 
  AlertTriangle, 
  MessageSquare, 
  Upload, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Gavel,
  BookOpen,
  ShieldAlert,
  TrendingUp
} from 'lucide-react';

interface LegalDocument {
  id: string;
  document_title: string;
  document_type: string;
  status: string;
  simplified_summary: string;
  key_provisions: string[];
  enforcement_date: string;
  affected_sectors: string[];
}

interface ConstitutionalViolation {
  id: string;
  violation_type: string;
  severity_level: string;
  violation_description: string;
  created_at: string;
}

interface LegalStats {
  active_laws: number;
  pending_policies: number;
  constitutional_alerts: number;
  recent_laws: number;
}

export const LegalIntelligenceCore: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [legalStats, setLegalStats] = useState<LegalStats | null>(null);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [violations, setViolations] = useState<ConstitutionalViolation[]>([]);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const { toast } = useToast();

  // New document form
  const [newDocument, setNewDocument] = useState({
    document_title: '',
    document_type: 'law',
    original_text: '',
    jurisdiction: 'national',
    ministry_department: '',
    status: 'draft'
  });

  // Policy tracker form
  const [newPolicy, setNewPolicy] = useState({
    policy_title: '',
    policy_type: 'bill',
    initiator_name: '',
    initiator_type: 'mp',
    initiator_party: '',
    policy_summary: '',
    affected_sectors: [] as string[],
    affected_regions: [] as string[]
  });

  useEffect(() => {
    loadDashboardData();
    loadDocuments();
    loadViolations();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await supabase.functions.invoke('legal-intelligence-core', {
        body: { action: 'get_dashboard_stats' }
      });

      if (response.error) throw response.error;
      
      setLegalStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive"
      });
    }
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadViolations = async () => {
    try {
      const { data, error } = await supabase
        .from('constitutional_violations')
        .select('*')
        .eq('public_alert_issued', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setViolations(data || []);
    } catch (error) {
      console.error('Error loading violations:', error);
    }
  };

  const handleUploadDocument = async () => {
    if (!newDocument.document_title || !newDocument.original_text) {
      toast({
        title: "Missing Information",
        description: "Please provide document title and text",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Insert document into database
      const { data, error } = await supabase
        .from('legal_documents')
        .insert([{
          ...newDocument,
          source_official: true,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Process document with AI
      const response = await supabase.functions.invoke('legal-intelligence-core', {
        body: {
          action: 'process_document',
          document_id: data.id,
          document_text: newDocument.original_text,
          document_title: newDocument.document_title,
          document_type: newDocument.document_type
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Document Uploaded",
        description: `${newDocument.document_title} has been processed and analyzed`,
      });

      // Reset form and reload data
      setNewDocument({
        document_title: '',
        document_type: 'law',
        original_text: '',
        jurisdiction: 'national',
        ministry_department: '',
        status: 'draft'
      });
      loadDocuments();
      loadDashboardData();

    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload and process document",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleCheckCompliance = async (documentId: string, documentText: string) => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('legal-intelligence-core', {
        body: {
          action: 'check_compliance',
          document_id: documentId,
          document_text: documentText
        }
      });

      if (response.error) throw response.error;

      const result = response.data;
      
      toast({
        title: "Compliance Check Complete",
        description: `Found ${result.violations_found} potential violations. Compliance score: ${(result.compliance_score * 100).toFixed(1)}%`,
        variant: result.violations_found > 0 ? "destructive" : "default"
      });

      loadViolations();
    } catch (error) {
      console.error('Error checking compliance:', error);
      toast({
        title: "Compliance Check Failed",
        description: "Failed to analyze constitutional compliance",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleAskQuestion = async () => {
    if (!chatQuestion.trim()) return;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('legal-intelligence-core', {
        body: {
          action: 'explain_law',
          question: chatQuestion
        }
      });

      if (response.error) throw response.error;

      setChatResponse(response.data.simple_explanation);
      
    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        title: "Question Failed",
        description: "Failed to get law explanation",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleTrackPolicy = async () => {
    if (!newPolicy.policy_title) {
      toast({
        title: "Missing Information",
        description: "Please provide policy title",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('legal-intelligence-core', {
        body: {
          action: 'analyze_policy',
          policy_data: {
            ...newPolicy,
            proposed_date: new Date().toISOString().split('T')[0]
          }
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Policy Tracked",
        description: `${newPolicy.policy_title} is now being monitored`,
      });

      // Reset form
      setNewPolicy({
        policy_title: '',
        policy_type: 'bill',
        initiator_name: '',
        initiator_type: 'mp',
        initiator_party: '',
        policy_summary: '',
        affected_sectors: [],
        affected_regions: []
      });

      loadDashboardData();

    } catch (error) {
      console.error('Error tracking policy:', error);
      toast({
        title: "Policy Tracking Failed",
        description: "Failed to track policy",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enforced': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'passed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Legal Intelligence Core</h2>
          <p className="text-muted-foreground">
            Monitor laws, detect violations, and explain legal matters to citizens
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Scale className="h-4 w-4 mr-2" />
          Legal Sentinel Active
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">
            <TrendingUp className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload Law
          </TabsTrigger>
          <TabsTrigger value="track">
            <FileText className="h-4 w-4 mr-2" />
            Track Policy
          </TabsTrigger>
          <TabsTrigger value="violations">
            <ShieldAlert className="h-4 w-4 mr-2" />
            Flag Abuse
          </TabsTrigger>
          <TabsTrigger value="explain">
            <MessageSquare className="h-4 w-4 mr-2" />
            Ask Law
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Laws</CardTitle>
                <Gavel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{legalStats?.active_laws || 0}</div>
                <p className="text-xs text-muted-foreground">Currently enforced</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Policies</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{legalStats?.pending_policies || 0}</div>
                <p className="text-xs text-muted-foreground">Under review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Constitutional Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{legalStats?.constitutional_alerts || 0}</div>
                <p className="text-xs text-muted-foreground">Violations flagged</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Laws</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{legalStats?.recent_laws || 0}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Legal Documents</CardTitle>
                <CardDescription>Latest laws and policies processed</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-start space-x-3 p-3 border rounded">
                        <div className="flex-shrink-0">
                          {getStatusIcon(doc.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{doc.document_title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {doc.simplified_summary}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {doc.document_type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {doc.status}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCheckCompliance(doc.id, doc.simplified_summary)}
                        >
                          <Scale className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Constitutional Violations</CardTitle>
                <CardDescription>Flagged constitutional concerns</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {violations.map((violation) => (
                      <div key={violation.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={getSeverityColor(violation.severity_level)}>
                            {violation.severity_level.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(violation.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-1">
                          {violation.violation_type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {violation.violation_description}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Legal Document</CardTitle>
              <CardDescription>
                Upload and process new laws, bills, or decrees for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Election Law 2024"
                    value={newDocument.document_title}
                    onChange={(e) => setNewDocument({...newDocument, document_title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Document Type</Label>
                  <Select 
                    value={newDocument.document_type} 
                    onValueChange={(value) => setNewDocument({...newDocument, document_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="law">Law</SelectItem>
                      <SelectItem value="bill">Bill</SelectItem>
                      <SelectItem value="decree">Decree</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="regulation">Regulation</SelectItem>
                      <SelectItem value="constitutional_amendment">Constitutional Amendment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Select 
                    value={newDocument.jurisdiction} 
                    onValueChange={(value) => setNewDocument({...newDocument, jurisdiction: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national">National</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                      <SelectItem value="local">Local/Municipal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ministry">Ministry/Department</Label>
                  <Input
                    id="ministry"
                    placeholder="e.g., Ministry of Justice"
                    value={newDocument.ministry_department}
                    onChange={(e) => setNewDocument({...newDocument, ministry_department: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text">Document Text</Label>
                <Textarea
                  id="text"
                  placeholder="Paste the full text of the legal document here..."
                  value={newDocument.original_text}
                  onChange={(e) => setNewDocument({...newDocument, original_text: e.target.value})}
                  rows={8}
                />
              </div>

              <Button 
                onClick={handleUploadDocument} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Process Document
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="track" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Track Policy</CardTitle>
              <CardDescription>
                Monitor new policy proposals and legislative actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policy-title">Policy Title</Label>
                  <Input
                    id="policy-title"
                    placeholder="e.g., Digital ID Enforcement Order"
                    value={newPolicy.policy_title}
                    onChange={(e) => setNewPolicy({...newPolicy, policy_title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policy-type">Policy Type</Label>
                  <Select 
                    value={newPolicy.policy_type} 
                    onValueChange={(value) => setNewPolicy({...newPolicy, policy_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bill">Bill</SelectItem>
                      <SelectItem value="decree">Decree</SelectItem>
                      <SelectItem value="cabinet_action">Cabinet Action</SelectItem>
                      <SelectItem value="parliamentary_vote">Parliamentary Vote</SelectItem>
                      <SelectItem value="executive_order">Executive Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initiator">Initiator Name</Label>
                  <Input
                    id="initiator"
                    placeholder="e.g., Hon. John Doe"
                    value={newPolicy.initiator_name}
                    onChange={(e) => setNewPolicy({...newPolicy, initiator_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initiator-type">Initiator Type</Label>
                  <Select 
                    value={newPolicy.initiator_type} 
                    onValueChange={(value) => setNewPolicy({...newPolicy, initiator_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp">Member of Parliament</SelectItem>
                      <SelectItem value="minister">Minister</SelectItem>
                      <SelectItem value="president">President</SelectItem>
                      <SelectItem value="cabinet">Cabinet</SelectItem>
                      <SelectItem value="party">Political Party</SelectItem>
                      <SelectItem value="civil_society">Civil Society</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="party">Political Party</Label>
                  <Input
                    id="party"
                    placeholder="e.g., CPDM"
                    value={newPolicy.initiator_party}
                    onChange={(e) => setNewPolicy({...newPolicy, initiator_party: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="policy-summary">Policy Summary</Label>
                <Textarea
                  id="policy-summary"
                  placeholder="Brief description of what this policy aims to achieve..."
                  value={newPolicy.policy_summary}
                  onChange={(e) => setNewPolicy({...newPolicy, policy_summary: e.target.value})}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleTrackPolicy} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Start Tracking Policy
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Constitutional Violations</CardTitle>
              <CardDescription>
                Monitor and flag potential constitutional violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {violations.length === 0 ? (
                <div className="text-center py-8">
                  <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No constitutional violations flagged</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {violations.map((violation) => (
                    <Alert key={violation.id}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={getSeverityColor(violation.severity_level)}>
                            {violation.severity_level.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(violation.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-medium mb-1">
                          {violation.violation_type.replace('_', ' ')}
                        </p>
                        <p className="text-sm">{violation.violation_description}</p>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ask About Laws</CardTitle>
              <CardDescription>
                Get simple explanations of laws and legal concepts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Your Question</Label>
                <Textarea
                  id="question"
                  placeholder="e.g., What is Article 66? or Explain the new election law"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleAskQuestion} 
                disabled={isLoading || !chatQuestion.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask Question
                  </>
                )}
              </Button>

              {chatResponse && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Simple Explanation</Label>
                    <div className="p-4 bg-muted rounded border">
                      <p className="text-sm">{chatResponse}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};