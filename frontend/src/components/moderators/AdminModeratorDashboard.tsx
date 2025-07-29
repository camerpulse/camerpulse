import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, CheckCircle, X, Clock, AlertTriangle, 
  Eye, MessageSquare, Calendar, FileText, Crown, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModeratorApplication {
  id: string;
  user_id: string;
  full_name: string;
  village_of_origin: string;
  region_of_residence: string;
  civic_experience: string;
  preferred_coverage_area: string;
  preferred_role: string;
  application_status: string;
  admin_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  id_document_url: string | null;
}

interface CivicModerator {
  id: string;
  user_id: string;
  moderator_role: string;
  status: string;
  coverage_regions: string[];
  total_edits: number;
  total_approvals: number;
  total_rejections: number;
  last_active_at: string | null;
  created_at: string;
  application: {
    full_name: string;
    village_of_origin: string;
  };
}

const statusColors = {
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  interview_scheduled: 'bg-purple-100 text-purple-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const roleDisplayNames = {
  village_moderator: 'Village Moderator',
  subdivision_moderator: 'Subdivision Moderator',
  regional_moderator: 'Regional Moderator',
  national_civic_lead: 'National Civic Lead'
};

export const AdminModeratorDashboard: React.FC = () => {
  const [applications, setApplications] = useState<ModeratorApplication[]>([]);
  const [moderators, setModerators] = useState<CivicModerator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ModeratorApplication | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch pending applications
      const { data: applicationsData, error: appsError } = await supabase
        .from('moderator_applications')
        .select('*')
        .in('application_status', ['submitted', 'under_review', 'interview_scheduled'])
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;

      // Fetch current moderators
      const { data: moderatorsData, error: modsError } = await supabase
        .from('civic_moderators')
        .select(`
          *,
          application:moderator_applications(full_name, village_of_origin)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (modsError) throw modsError;

      setApplications(applicationsData || []);
      setModerators(moderatorsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationReview = async () => {
    if (!selectedApplication || !reviewAction) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (reviewAction === 'approve') {
        // Update application status
        const { error: updateError } = await supabase
          .from('moderator_applications')
          .update({
            application_status: 'approved',
            admin_notes: reviewNotes,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', selectedApplication.id);

        if (updateError) throw updateError;

        // Create civic moderator record
        const { error: createError } = await supabase
          .from('civic_moderators')
          .insert({
            user_id: selectedApplication.user_id,
            application_id: selectedApplication.id,
            moderator_role: selectedApplication.preferred_role as any,
            coverage_regions: [selectedApplication.region_of_residence],
            status: 'approved'
          });

        if (createError) throw createError;

        // Add user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: selectedApplication.user_id,
            role: selectedApplication.preferred_role as any
          });

        if (roleError) console.warn('Role assignment warning:', roleError);

        toast.success('Application approved successfully!');
      } else {
        // Reject application
        const { error } = await supabase
          .from('moderator_applications')
          .update({
            application_status: 'rejected',
            rejection_reason: reviewNotes,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', selectedApplication.id);

        if (error) throw error;

        toast.success('Application rejected');
      }

      setSelectedApplication(null);
      setReviewAction(null);
      setReviewNotes('');
      fetchData();
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error('Failed to process application');
    }
  };

  const suspendModerator = async (moderatorId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('civic_moderators')
        .update({
          status: 'suspended',
          suspension_reason: reason,
          suspended_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .eq('id', moderatorId);

      if (error) throw error;

      toast.success('Moderator suspended successfully');
      fetchData();
    } catch (error) {
      console.error('Error suspending moderator:', error);
      toast.error('Failed to suspend moderator');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = applications.filter(app => app.application_status === 'submitted').length;
  const underReviewCount = applications.filter(app => app.application_status === 'under_review').length;
  const totalModerators = moderators.length;
  const activeModerators = moderators.filter(mod => 
    !mod.last_active_at || 
    (Date.now() - new Date(mod.last_active_at).getTime()) < 30 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Crown className="h-8 w-8 mr-3 text-civic" />
              Admin: Moderator Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage civic moderator applications and oversight
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Applications</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{underReviewCount}</p>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalModerators}</p>
                <p className="text-sm text-muted-foreground">Total Moderators</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-civic/10 rounded-lg mr-4">
                <Users className="h-6 w-6 text-civic" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeModerators}</p>
                <p className="text-sm text-muted-foreground">Active This Month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="applications">
              Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="moderators">
              Active Moderators ({moderators.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Moderator Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No pending applications</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold">{application.full_name}</h3>
                              <Badge className={statusColors[application.application_status as keyof typeof statusColors]}>
                                {application.application_status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Village:</span>
                                <p className="font-medium">{application.village_of_origin}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Region:</span>
                                <p className="font-medium">{application.region_of_residence}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Preferred Role:</span>
                                <p className="font-medium">
                                  {roleDisplayNames[application.preferred_role as keyof typeof roleDisplayNames]}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <span className="text-muted-foreground text-sm">Coverage Area:</span>
                              <p className="text-sm">{application.preferred_coverage_area}</p>
                            </div>
                            
                            <div className="mt-2 text-xs text-muted-foreground">
                              Applied {new Date(application.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 ml-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedApplication(application)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Review Application</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">Full Name</Label>
                                      <p className="text-sm">{application.full_name}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Village of Origin</Label>
                                      <p className="text-sm">{application.village_of_origin}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium">Civic Experience</Label>
                                    <p className="text-sm mt-1 p-3 bg-muted/50 rounded">
                                      {application.civic_experience}
                                    </p>
                                  </div>
                                  
                                  {application.id_document_url && (
                                    <div>
                                      <Label className="text-sm font-medium">ID Document</Label>
                                      <a 
                                        href={application.id_document_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-civic hover:underline text-sm block mt-1"
                                      >
                                        View Document
                                      </a>
                                    </div>
                                  )}
                                  
                                  <div className="space-y-3">
                                    <Label className="text-sm font-medium">Decision</Label>
                                    <div className="flex space-x-2">
                                      <Button
                                        variant={reviewAction === 'approve' ? 'default' : 'outline'}
                                        onClick={() => setReviewAction('approve')}
                                        className="flex-1"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                      <Button
                                        variant={reviewAction === 'reject' ? 'destructive' : 'outline'}
                                        onClick={() => setReviewAction('reject')}
                                        className="flex-1"
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium">
                                      {reviewAction === 'approve' ? 'Approval Notes' : 'Rejection Reason'}
                                    </Label>
                                    <Textarea
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      placeholder={
                                        reviewAction === 'approve' 
                                          ? 'Optional notes for the new moderator...'
                                          : 'Please provide a reason for rejection...'
                                      }
                                      className="mt-1"
                                    />
                                  </div>
                                  
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedApplication(null);
                                        setReviewAction(null);
                                        setReviewNotes('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      onClick={handleApplicationReview}
                                      disabled={!reviewAction}
                                    >
                                      Submit Decision
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

          <TabsContent value="moderators" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Active Moderators
                </CardTitle>
              </CardHeader>
              <CardContent>
                {moderators.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No active moderators</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {moderators.map((moderator) => (
                      <div key={moderator.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {moderator.application?.full_name?.charAt(0) || 'M'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <h3 className="font-semibold">
                                {moderator.application?.full_name || 'Moderator'}
                              </h3>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Badge variant="outline">
                                  {roleDisplayNames[moderator.moderator_role as keyof typeof roleDisplayNames]}
                                </Badge>
                                <span>•</span>
                                <span>{moderator.coverage_regions.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right text-sm">
                              <div className="font-medium">{moderator.total_edits} edits</div>
                              <div className="text-muted-foreground">
                                {moderator.total_approvals} approvals
                              </div>
                            </div>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => suspendModerator(moderator.id, 'Admin action')}
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};