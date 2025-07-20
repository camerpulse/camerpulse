import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Check, 
  X, 
  Flag, 
  Shield, 
  AlertTriangle, 
  Eye,
  Clock,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface PendingAudit {
  id: string;
  document_title: string;
  entity_audited: string;
  audit_summary: string;
  source_type: string;
  source_organization: string;
  is_anonymous_submission: boolean;
  is_sensitive: boolean;
  created_at: string;
  submitted_by: string;
  status: string;
  document_authenticity: string;
}

interface AuditFlag {
  id: string;
  audit_id: string;
  flagged_by: string;
  flag_reason: string;
  flag_description: string;
  flag_status: string;
  created_at: string;
  audit_registry: {
    document_title: string;
    entity_audited: string;
  };
}

export const AdminAuditTools = () => {
  const [pendingAudits, setPendingAudits] = useState<PendingAudit[]>([]);
  const [auditFlags, setAuditFlags] = useState<AuditFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [authenticityStatus, setAuthenticityStatus] = useState('');

  useEffect(() => {
    fetchPendingAuditsAndFlags();
  }, []);

  const fetchPendingAuditsAndFlags = async () => {
    try {
      // Fetch pending audits
      const { data: auditsData, error: auditsError } = await supabase
        .from('audit_registry')
        .select('*')
        .in('status', ['pending_review', 'draft'])
        .order('created_at', { ascending: false });

      if (auditsError) throw auditsError;

      setPendingAudits(auditsData || []);

      // Fetch audit flags
      const { data: flagsData, error: flagsError } = await supabase
        .from('audit_flags')
        .select(`
          *,
          audit_registry:audit_id (
            document_title,
            entity_audited
          )
        `)
        .eq('flag_status', 'pending')
        .order('created_at', { ascending: false });

      if (flagsError) throw flagsError;

      setAuditFlags(flagsData || []);

    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleAuditApproval = async (auditId: string, approved: boolean) => {
    try {
      const user = await supabase.auth.getUser();
      
      const updateData = {
        status: (approved ? 'approved' : 'rejected') as any,
        approved_by: user.data.user?.id,
        approved_at: new Date().toISOString(),
        document_authenticity: (authenticityStatus || 'pending_verification') as any
      };

      const { error } = await supabase
        .from('audit_registry')
        .update(updateData)
        .eq('id', auditId);

      if (error) throw error;

      toast.success(`Audit ${approved ? 'approved' : 'rejected'} successfully`);
      
      // Reset form
      setSelectedAudit(null);
      setReviewNotes('');
      setAuthenticityStatus('');
      
      // Refresh data
      fetchPendingAuditsAndFlags();

    } catch (error: any) {
      console.error('Error updating audit:', error);
      toast.error('Failed to update audit');
    }
  };

  const handleFlagReview = async (flagId: string, resolution: string) => {
    try {
      const user = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('audit_flags')
        .update({
          flag_status: resolution,
          reviewed_by: user.data.user?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', flagId);

      if (error) throw error;

      toast.success(`Flag ${resolution} successfully`);
      
      // Reset form
      setReviewNotes('');
      
      // Refresh data
      fetchPendingAuditsAndFlags();

    } catch (error: any) {
      console.error('Error updating flag:', error);
      toast.error('Failed to update flag');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'flagged':
        return <Badge variant="destructive">Flagged</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSourceTypeLabel = (sourceType: string) => {
    return sourceType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Administration</h1>
          <p className="text-muted-foreground mt-2">
            Manage audit submissions, review flags, and maintain data integrity
          </p>
        </div>
        
        <div className="flex gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending Review</p>
                <p className="text-2xl font-bold">{pendingAudits.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Flags to Review</p>
                <p className="text-2xl font-bold">{auditFlags.length}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Audits ({pendingAudits.length})</TabsTrigger>
          <TabsTrigger value="flags">Audit Flags ({auditFlags.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {pendingAudits.map((audit) => (
              <Card key={audit.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        {audit.is_sensitive && <Shield className="w-4 h-4 text-yellow-500" />}
                        {audit.is_anonymous_submission && <Users className="w-4 h-4 text-blue-500" />}
                        {audit.document_title}
                      </CardTitle>
                      <CardDescription>
                        <span className="font-medium">{audit.entity_audited}</span>
                        {` • ${getSourceTypeLabel(audit.source_type)}`}
                        {audit.source_organization && ` • ${audit.source_organization}`}
                      </CardDescription>
                    </div>
                    {getStatusBadge(audit.status)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {audit.audit_summary}
                    </p>

                    <div className="text-xs text-muted-foreground">
                      Submitted: {new Date(audit.created_at).toLocaleString()}
                      {audit.is_anonymous_submission && (
                        <span className="ml-4 text-blue-600">Anonymous Submission</span>
                      )}
                    </div>

                    {selectedAudit === audit.id ? (
                      <div className="space-y-4 border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Document Authenticity</Label>
                            <Select value={authenticityStatus} onValueChange={setAuthenticityStatus}>
                              <SelectTrigger>
                                <SelectValue placeholder="Set authenticity status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="pending_verification">Pending Verification</SelectItem>
                                <SelectItem value="questionable">Questionable</SelectItem>
                                <SelectItem value="disputed">Disputed</SelectItem>
                                <SelectItem value="fake_flagged">Flagged as Fake</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Review Notes (optional)</Label>
                          <Textarea
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Add review notes..."
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleAuditApproval(audit.id, true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve & Publish
                          </Button>
                          
                          <Button 
                            variant="destructive"
                            onClick={() => handleAuditApproval(audit.id, false)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          
                          <Button 
                            variant="outline"
                            onClick={() => setSelectedAudit(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => setSelectedAudit(audit.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pendingAudits.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending audits</h3>
                <p className="text-muted-foreground">
                  All audit submissions have been reviewed.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="flags" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {auditFlags.map((flag) => (
              <Card key={flag.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <Flag className="w-4 h-4 text-red-500" />
                        Flag Report: {flag.audit_registry?.document_title}
                      </CardTitle>
                      <CardDescription>
                        Reason: {flag.flag_reason} • 
                        Flagged: {new Date(flag.created_at).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Flag Description:</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {flag.flag_description || 'No description provided'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Review Notes</Label>
                      <Textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add review notes..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => handleFlagReview(flag.id, 'resolved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Resolve Flag
                      </Button>
                      
                      <Button 
                        size="sm"
                        variant="destructive"
                        onClick={() => handleFlagReview(flag.id, 'confirmed')}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Confirm Issue
                      </Button>
                      
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleFlagReview(flag.id, 'dismissed')}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {auditFlags.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No flags to review</h3>
                <p className="text-muted-foreground">
                  All audit flags have been reviewed.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};