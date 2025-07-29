import React, { useState, useEffect } from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Plus, 
  Eye, 
  FileText, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard
} from 'lucide-react';
import { Job, JobApplication } from '@/types/jobs';

interface CompanyDashboardProps {
  company: any;
  onCreateJob?: () => void;
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ company, onCreateJob }) => {
  const { getCompanyJobs, getJobApplications } = useCompanies();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!company?.id) return;
      
      try {
        setLoading(true);
        const [jobsData, applicationsData] = await Promise.all([
          getCompanyJobs(company.id),
          getJobApplications(company.id)
        ]);
        
        setJobs(jobsData as unknown as Job[]);
        setApplications(applicationsData as unknown as JobApplication[]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [company?.id]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: 'Pending Approval', variant: 'secondary' as const, icon: Clock },
      'approved': { label: 'Approved', variant: 'default' as const, icon: CheckCircle },
      'rejected': { label: 'Rejected', variant: 'destructive' as const, icon: AlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: 'Payment Pending', variant: 'secondary' as const },
      'paid': { label: 'Paid', variant: 'default' as const },
      'expired': { label: 'Expired', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <CreditCard className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(job => job.status === 'active').length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{company.company_name}</h1>
            <p className="text-muted-foreground">{company.sector} • {company.region}</p>
            <div className="flex items-center gap-2 mt-2">
              {getStatusBadge(company.status)}
              {getPaymentStatusBadge(company.payment_status)}
            </div>
          </div>
        </div>
        <Button onClick={onCreateJob} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Post New Job
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.activeJobs}</p>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
                <p className="text-sm text-muted-foreground">Total Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Notice */}
      {company.payment_status === 'pending' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <CreditCard className="h-8 w-8 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-800">Payment Required</h3>
                <p className="text-orange-700">
                  Please complete your registration payment of 25,000 FCFA to activate job posting features.
                </p>
                <Button variant="outline" className="mt-2">
                  Complete Payment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Tabs */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Jobs Posted Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by posting your first job to attract top talent.
                </p>
                <Button onClick={onCreateJob}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <p className="text-muted-foreground">{job.location} • {job.job_type}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                          {job.is_featured && <Badge variant="outline">Featured</Badge>}
                          {job.is_urgent && <Badge variant="destructive">Urgent</Badge>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          {job.views_count || 0} views
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {job.applications_count || 0} applications
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground">
                  Applications will appear here when candidates apply to your jobs.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 10).map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{application.job?.title}</h3>
                        <p className="text-muted-foreground">
                          Applied by: {application.applicant_name || application.profiles?.display_name || 'Candidate'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(application.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        application.status === 'pending' ? 'secondary' :
                        application.status === 'hired' ? 'default' :
                        application.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {application.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Detailed analytics coming soon
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};