import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle, XCircle, Clock, Eye, FileText, AlertTriangle,
  DollarSign, Calendar, User, Building, Flag, MessageSquare
} from 'lucide-react';

interface Tender {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  created_at: string;
  created_by: string;
  category: string;
  location: string;
  requirements: string[];
  documents: string[];
  approval_notes?: string;
  rejection_reason?: string;
}

interface ApprovalAction {
  id: string;
  tender_id: string;
  action: 'approve' | 'reject' | 'request_changes';
  notes: string;
  created_at: string;
  admin_id: string;
}

export const TenderApprovalWorkflow: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch pending tenders
  const { data: pendingTenders, isLoading } = useQuery({
    queryKey: ['pending_tenders_approval'],
    queryFn: async (): Promise<Tender[]> => {
      const { data, error } = await supabase
        .from('tenders')
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch approved tenders
  const { data: approvedTenders } = useQuery({
    queryKey: ['approved_tenders'],
    queryFn: async (): Promise<Tender[]> => {
      const { data, error } = await supabase
        .from('tenders')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch rejected tenders
  const { data: rejectedTenders } = useQuery({
    queryKey: ['rejected_tenders'],
    queryFn: async (): Promise<Tender[]> => {
      const { data, error } = await supabase
        .from('tenders')
        .select('*')
        .eq('status', 'rejected')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch approval history
  const { data: approvalHistory } = useQuery({
    queryKey: ['approval_history'],
    queryFn: async (): Promise<ApprovalAction[]> => {
      const { data, error } = await supabase
        .from('tender_approval_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching approval history:', error);
        return [];
      }
      return data || [];
    },
  });

  // Approve tender mutation
  const approveTenderMutation = useMutation({
    mutationFn: async ({ tenderId, notes }: { tenderId: string; notes: string }) => {
      const { error } = await supabase
        .from('tenders')
        .update({
          status: 'open',
          approval_notes: notes,
          approved_at: new Date().toISOString()
        })
        .eq('id', tenderId);

      if (error) throw error;

      // Log approval action
      await supabase.from('tender_approval_log').insert({
        tender_id: tenderId,
        action: 'approve',
        notes: notes,
        admin_id: (await supabase.auth.getUser()).data.user?.id
      });
    },
    onSuccess: () => {
      toast({
        title: "Tender Approved",
        description: "The tender has been approved and is now open for bids.",
      });
      queryClient.invalidateQueries({ queryKey: ['pending_tenders_approval'] });
      queryClient.invalidateQueries({ queryKey: ['approved_tenders'] });
      queryClient.invalidateQueries({ queryKey: ['approval_history'] });
      setSelectedTender(null);
      setApprovalNotes('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to approve tender.",
        variant: "destructive",
      });
      console.error('Approve tender error:', error);
    },
  });

  // Reject tender mutation
  const rejectTenderMutation = useMutation({
    mutationFn: async ({ tenderId, reason }: { tenderId: string; reason: string }) => {
      const { error } = await supabase
        .from('tenders')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString()
        })
        .eq('id', tenderId);

      if (error) throw error;

      // Log rejection action
      await supabase.from('tender_approval_log').insert({
        tender_id: tenderId,
        action: 'reject',
        notes: reason,
        admin_id: (await supabase.auth.getUser()).data.user?.id
      });
    },
    onSuccess: () => {
      toast({
        title: "Tender Rejected",
        description: "The tender has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['pending_tenders_approval'] });
      queryClient.invalidateQueries({ queryKey: ['rejected_tenders'] });
      queryClient.invalidateQueries({ queryKey: ['approval_history'] });
      setSelectedTender(null);
      setRejectionReason('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reject tender.",
        variant: "destructive",
      });
      console.error('Reject tender error:', error);
    },
  });

  const handleApproveTender = () => {
    if (!selectedTender) return;
    approveTenderMutation.mutate({ 
      tenderId: selectedTender.id, 
      notes: approvalNotes || 'Approved by admin' 
    });
  };

  const handleRejectTender = () => {
    if (!selectedTender || !rejectionReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    rejectTenderMutation.mutate({ 
      tenderId: selectedTender.id, 
      reason: rejectionReason 
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      open: { label: 'Approved', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tender Approval Workflow</h2>
          <p className="text-muted-foreground">Review and approve tender submissions</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {pendingTenders?.length || 0} Pending
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({pendingTenders?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
          </TabsTrigger>
          <TabsTrigger value="history">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Tenders waiting for admin review</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : pendingTenders?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No pending tenders for approval
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingTenders?.map((tender) => (
                    <div key={tender.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{tender.title}</h4>
                            {getStatusBadge(tender.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {tender.description}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span>${tender.budget?.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span>{new Date(tender.deadline).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4 text-purple-600" />
                              <span>{tender.category}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-orange-600" />
                              <span>ID: {tender.created_by.slice(0, 8)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedTender(tender)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Review Tender: {tender.title}</DialogTitle>
                                <DialogDescription>
                                  Review tender details and make approval decision
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-medium mb-2">Basic Information</h5>
                                    <div className="space-y-2 text-sm">
                                      <p><strong>Budget:</strong> ${tender.budget?.toLocaleString()}</p>
                                      <p><strong>Deadline:</strong> {new Date(tender.deadline).toLocaleDateString()}</p>
                                      <p><strong>Category:</strong> {tender.category}</p>
                                      <p><strong>Location:</strong> {tender.location}</p>
                                      <p><strong>Submitted:</strong> {new Date(tender.created_at).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h5 className="font-medium mb-2">Requirements</h5>
                                    <div className="text-sm space-y-1">
                                      {tender.requirements?.map((req, index) => (
                                        <p key={index}>• {req}</p>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h5 className="font-medium mb-2">Description</h5>
                                  <p className="text-sm text-muted-foreground">{tender.description}</p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                  <div className="flex-1">
                                    <label className="text-sm font-medium">Approval Notes (Optional)</label>
                                    <Textarea
                                      placeholder="Add any notes about this approval..."
                                      value={approvalNotes}
                                      onChange={(e) => setApprovalNotes(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-sm font-medium">Rejection Reason</label>
                                    <Textarea
                                      placeholder="Provide reason for rejection..."
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                </div>

                                <div className="flex gap-2 justify-end pt-4">
                                  <Button 
                                    variant="destructive"
                                    onClick={handleRejectTender}
                                    disabled={rejectTenderMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button 
                                    onClick={handleApproveTender}
                                    disabled={approveTenderMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Tenders</CardTitle>
              <CardDescription>Recently approved tenders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvedTenders?.map((tender) => (
                  <div key={tender.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{tender.title}</h4>
                        {getStatusBadge(tender.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Budget: ${tender.budget?.toLocaleString()} • 
                        Approved: {tender.approved_at ? new Date(tender.approved_at).toLocaleDateString() : 'N/A'}
                      </p>
                      {tender.approval_notes && (
                        <p className="text-sm text-blue-600 mt-1">
                          <MessageSquare className="h-3 w-3 inline mr-1" />
                          {tender.approval_notes}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Tenders</CardTitle>
              <CardDescription>Recently rejected tenders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rejectedTenders?.map((tender) => (
                  <div key={tender.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{tender.title}</h4>
                        {getStatusBadge(tender.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Budget: ${tender.budget?.toLocaleString()} • 
                        Rejected: {tender.rejected_at ? new Date(tender.rejected_at).toLocaleDateString() : 'N/A'}
                      </p>
                      {tender.rejection_reason && (
                        <p className="text-sm text-destructive mt-1">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          {tender.rejection_reason}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
              <CardDescription>Complete log of all approval actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvalHistory?.map((action) => (
                  <div key={action.id} className="flex items-center gap-4 p-3 border-l-2 border-primary">
                    <div className="flex-1">
                      <p className="font-medium">
                        Tender {action.action === 'approve' ? 'Approved' : 'Rejected'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID: {action.tender_id.slice(0, 8)} • {new Date(action.created_at).toLocaleString()}
                      </p>
                      {action.notes && (
                        <p className="text-sm mt-1">{action.notes}</p>
                      )}
                    </div>
                    <Badge variant={action.action === 'approve' ? 'default' : 'destructive'}>
                      {action.action}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};