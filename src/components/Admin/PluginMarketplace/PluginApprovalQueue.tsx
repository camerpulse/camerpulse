import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePluginSubmissions } from '@/hooks/usePluginMarketplace';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Shield,
  Package,
  User,
  Calendar,
  AlertTriangle,
  Code,
  Download,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export const PluginApprovalQueue: React.FC = () => {
  const { submissions, isLoading, approveSubmission, rejectSubmission, isProcessing } = usePluginSubmissions();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'in_review':
        return <Badge className="bg-blue-100 text-blue-800"><Eye className="h-3 w-3 mr-1" />In Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'needs_changes':
        return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />Needs Changes</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = async (submissionId: string) => {
    try {
      await approveSubmission({ submissionId, notes: reviewNotes });
      setReviewNotes('');
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleReject = async (submissionId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    try {
      await rejectSubmission({ 
        submissionId, 
        reason: rejectionReason, 
        notes: reviewNotes 
      });
      setReviewNotes('');
      setRejectionReason('');
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Rejection failed:', error);
    }
  };

  const getRiskLevel = (manifest: any) => {
    const permissions = manifest.permissions || [];
    const dangerousPerms = ['admin.access', 'database.write', 'user.profile.read'];
    const riskCount = permissions.filter((p: string) => dangerousPerms.includes(p)).length;
    
    if (riskCount >= 2) return 'high';
    if (riskCount === 1) return 'medium';
    return 'low';
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-800">Medium Risk</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const inReviewSubmissions = submissions.filter(s => s.status === 'in_review');
  const processedSubmissions = submissions.filter(s => ['approved', 'rejected', 'needs_changes'].includes(s.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="h-8 w-8 mr-3" />
            Plugin Approval Queue
          </h1>
          <p className="text-muted-foreground">
            Review and approve plugin submissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{pendingSubmissions.length} Pending</Badge>
          <Badge variant="outline">{inReviewSubmissions.length} In Review</Badge>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="in-review">
            In Review ({inReviewSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="processed">
            Processed ({processedSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingSubmissions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No pending submissions</h3>
                <p className="text-muted-foreground">All submissions have been reviewed</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingSubmissions.map((submission) => (
                <Card key={submission.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {submission.manifest_data.name}
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            v{submission.manifest_data.version}
                          </span>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {submission.manifest_data.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(submission.status)}
                        {getRiskBadge(getRiskLevel(submission.manifest_data))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{submission.submitter_name}</span>
                      </div>
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{submission.manifest_data.category}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{submission.manifest_data.permissions?.length || 0} permissions</span>
                      </div>
                    </div>

                    {submission.manifest_data.permissions && submission.manifest_data.permissions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {submission.manifest_data.permissions.slice(0, 3).map((permission: string) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {submission.manifest_data.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{submission.manifest_data.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{submission.submission_type}</Badge>
                        {submission.plugin_data.sourceType === 'github' && (
                          <Badge variant="outline" className="text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            GitHub
                          </Badge>
                        )}
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center">
                              <Package className="h-5 w-5 mr-2" />
                              Review: {submission.manifest_data.name}
                            </DialogTitle>
                          </DialogHeader>
                          
                          {selectedSubmission && (
                            <div className="space-y-6">
                              {/* Plugin Details */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Plugin Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>Name:</strong> {selectedSubmission.manifest_data.name}</div>
                                    <div><strong>Version:</strong> {selectedSubmission.manifest_data.version}</div>
                                    <div><strong>Author:</strong> {selectedSubmission.manifest_data.author}</div>
                                    <div><strong>Category:</strong> {selectedSubmission.manifest_data.category}</div>
                                  </div>
                                  <div>
                                    <strong>Description:</strong>
                                    <p className="mt-1 text-muted-foreground">{selectedSubmission.manifest_data.description}</p>
                                  </div>
                                  
                                  {selectedSubmission.manifest_data.tags && selectedSubmission.manifest_data.tags.length > 0 && (
                                    <div>
                                      <strong>Tags:</strong>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedSubmission.manifest_data.tags.map((tag: string) => (
                                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>

                              {/* Security Analysis */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base flex items-center">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Security Analysis
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span>Risk Level:</span>
                                    {getRiskBadge(getRiskLevel(selectedSubmission.manifest_data))}
                                  </div>
                                  
                                  {selectedSubmission.manifest_data.permissions && selectedSubmission.manifest_data.permissions.length > 0 && (
                                    <div>
                                      <strong>Requested Permissions:</strong>
                                      <div className="grid grid-cols-2 gap-2 mt-2">
                                        {selectedSubmission.manifest_data.permissions.map((permission: string) => (
                                          <div key={permission} className="flex items-center text-sm">
                                            <Shield className="h-3 w-3 mr-2 text-muted-foreground" />
                                            {permission}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>

                              {/* Source Information */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base flex items-center">
                                    <Code className="h-4 w-4 mr-2" />
                                    Source Information
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>Source Type:</strong> {selectedSubmission.plugin_data.sourceType}</div>
                                    <div><strong>Entry Point:</strong> {selectedSubmission.manifest_data.main}</div>
                                  </div>
                                  
                                  {selectedSubmission.plugin_data.githubRepo && (
                                    <div>
                                      <strong>GitHub Repository:</strong>
                                      <p className="text-blue-600 hover:underline cursor-pointer">
                                        {selectedSubmission.plugin_data.githubRepo}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {selectedSubmission.plugin_data.bundleUrl && (
                                    <div>
                                      <strong>Remote Bundle URL:</strong>
                                      <p className="text-blue-600 hover:underline cursor-pointer">
                                        {selectedSubmission.plugin_data.bundleUrl}
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>

                              {/* Review Actions */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Review Decision</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Review Notes</label>
                                    <Textarea
                                      placeholder="Add any notes about your review..."
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      rows={3}
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Rejection Reason (if rejecting)</label>
                                    <Textarea
                                      placeholder="Explain why this plugin is being rejected..."
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      rows={2}
                                    />
                                  </div>

                                  <div className="flex justify-end space-x-3 pt-4">
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleReject(selectedSubmission.id)}
                                      disabled={isProcessing}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                    <Button
                                      onClick={() => handleApprove(selectedSubmission.id)}
                                      disabled={isProcessing}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-review">
          <div className="grid gap-4">
            {inReviewSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{submission.manifest_data.name}</CardTitle>
                      <CardDescription>{submission.manifest_data.description}</CardDescription>
                    </div>
                    {getStatusBadge(submission.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Currently under review by admin team...
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="processed">
          <div className="grid gap-4">
            {processedSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{submission.manifest_data.name}</CardTitle>
                      <CardDescription>{submission.manifest_data.description}</CardDescription>
                    </div>
                    {getStatusBadge(submission.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {submission.reviewer_notes && (
                    <div className="text-sm">
                      <strong>Review Notes:</strong>
                      <p className="text-muted-foreground mt-1">{submission.reviewer_notes}</p>
                    </div>
                  )}
                  {submission.rejection_reason && (
                    <div className="text-sm mt-2">
                      <strong>Rejection Reason:</strong>
                      <p className="text-muted-foreground mt-1">{submission.rejection_reason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};