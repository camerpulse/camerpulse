import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  DollarSign,
  Star,
  MessageCircle,
  Eye,
  Download
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Application {
  id: string;
  applicant_email: string;
  applicant_name: string;
  job_id: string;
  cover_letter: string;
  resume_url?: string;
  application_status: string;
  application_score?: number;
  recruiter_notes?: string;
  salary_offered?: number;
  interview_scheduled_at?: string;
  applied_at: string;
  jobs: {
    title: string;
    company_name: string;
  };
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-green-100 text-green-800',
  interview_scheduled: 'bg-purple-100 text-purple-800',
  interviewed: 'bg-indigo-100 text-indigo-800',
  rejected: 'bg-red-100 text-red-800',
  hired: 'bg-emerald-100 text-emerald-800'
};

const STATUS_ICONS = {
  pending: Clock,
  reviewing: Eye,
  shortlisted: Star,
  interview_scheduled: Calendar,
  interviewed: MessageCircle,
  rejected: XCircle,
  hired: CheckCircle
};

export const ApplicationsDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [user, statusFilter]);

  const fetchApplications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('job_applications')
        .select(`
          *,
          jobs!inner(title, company_name, posted_by)
        `)
        .eq('jobs.created_by', user.id);

      if (statusFilter !== 'all') {
        query = query.eq('application_status', statusFilter);
      }

      const { data, error } = await query.order('applied_at', { ascending: false });
      
      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch applications');
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string, 
    newStatus: string,
    notes?: string,
    salaryOffered?: number,
    interviewDate?: string
  ) => {
    setUpdatingStatus(true);
    
    try {
      const updateData: any = {
        application_status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (notes) updateData.recruiter_notes = notes;
      if (salaryOffered) updateData.salary_offered = salaryOffered;
      if (interviewDate) updateData.interview_scheduled_at = new Date(interviewDate).toISOString();

      const { error } = await supabase
        .from('job_applications')
        .update(updateData)
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('Application status updated successfully');
      fetchApplications();
      setSelectedApplication(null);
    } catch (error: any) {
      toast.error('Failed to update application status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock;
    return (
      <Badge className={STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const ApplicationCard = ({ application }: { application: Application }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setSelectedApplication(application)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-lg">{application.applicant_name || 'Unknown Applicant'}</h3>
            <p className="text-sm text-muted-foreground">Applied for {application.jobs?.title}</p>
          </div>
          {getStatusBadge(application.application_status)}
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}
          </span>
          
          {application.application_score && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {application.application_score}/100
            </span>
          )}
        </div>

        {application.cover_letter && (
          <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">
            {application.cover_letter.substring(0, 100)}...
          </p>
        )}
      </CardContent>
    </Card>
  );

  const ApplicationDetail = ({ application }: { application: Application }) => {
    const [newStatus, setNewStatus] = useState(application.application_status);
    const [notes, setNotes] = useState(application.recruiter_notes || '');
    const [salaryOffer, setSalaryOffer] = useState(application.salary_offered?.toString() || '');
    const [interviewDate, setInterviewDate] = useState(
      application.interview_scheduled_at ? 
        new Date(application.interview_scheduled_at).toISOString().split('T')[0] : ''
    );
    const [score, setScore] = useState(application.application_score?.toString() || '');

    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{application.applicant_name || 'Unknown Applicant'}</span>
            <Button variant="outline" size="sm" onClick={() => setSelectedApplication(null)}>
              Close
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Applicant Info */}
          <div>
            <h4 className="font-medium mb-2">Application Details</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Job:</strong> {application.jobs?.title}</p>
              <p><strong>Applied:</strong> {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}</p>
              <p><strong>Status:</strong> {getStatusBadge(application.application_status)}</p>
            </div>
          </div>

          {/* Cover Letter */}
          {application.cover_letter && (
            <div>
              <h4 className="font-medium mb-2">Cover Letter</h4>
              <div className="bg-muted p-4 rounded-lg text-sm">
                {application.cover_letter}
              </div>
            </div>
          )}

          {/* Resume */}
          {application.resume_url && (
            <div>
              <h4 className="font-medium mb-2">Resume</h4>
              <Button variant="outline" size="sm" asChild>
                <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download Resume
                </a>
              </Button>
            </div>
          )}

          {/* Status Update Form */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Update Application</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                    <SelectItem value="interviewed">Interviewed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Score (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Rate this application"
                />
              </div>
            </div>

            {newStatus === 'interview_scheduled' && (
              <div className="space-y-2">
                <Label>Interview Date</Label>
                <Input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>
            )}

            {newStatus === 'hired' && (
              <div className="space-y-2">
                <Label>Salary Offer (FCFA)</Label>
                <Input
                  type="number"
                  value={salaryOffer}
                  onChange={(e) => setSalaryOffer(e.target.value)}
                  placeholder="e.g. 600000"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Recruiter Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this candidate..."
                rows={3}
              />
            </div>

            <Button
              onClick={() => updateApplicationStatus(
                application.id,
                newStatus,
                notes,
                salaryOffer ? parseInt(salaryOffer) : undefined,
                interviewDate || undefined
              )}
              disabled={updatingStatus}
              className="w-full"
            >
              {updatingStatus ? 'Updating...' : 'Update Application'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getStatusCounts = () => {
    const counts = applications.reduce((acc, app) => {
      acc[app.application_status] = (acc[app.application_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: applications.length,
      pending: counts.pending || 0,
      reviewing: counts.reviewing || 0,
      shortlisted: counts.shortlisted || 0,
      interviewed: counts.interviewed || 0,
      hired: counts.hired || 0,
      rejected: counts.rejected || 0
    };
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{statusCounts.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold">{statusCounts.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Eye className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{statusCounts.reviewing}</p>
              <p className="text-sm text-muted-foreground">Reviewing</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Star className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{statusCounts.shortlisted}</p>
              <p className="text-sm text-muted-foreground">Shortlisted</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <MessageCircle className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">{statusCounts.interviewed}</p>
              <p className="text-sm text-muted-foreground">Interviewed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
              <p className="text-2xl font-bold">{statusCounts.hired}</p>
              <p className="text-sm text-muted-foreground">Hired</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <XCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold">{statusCounts.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
            <SelectItem value="interviewed">Interviewed</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications List */}
        <div className={`space-y-4 ${selectedApplication ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
          {applications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground">
                  Applications for your job postings will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))
          )}
        </div>

        {/* Application Detail */}
        {selectedApplication && (
          <div className="lg:col-span-2">
            <ApplicationDetail application={selectedApplication} />
          </div>
        )}
      </div>
    </div>
  );
};