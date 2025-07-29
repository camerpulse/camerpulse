import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { DataTableCard } from '../components/DataTableCard';
import { 
  Briefcase, 
  Users, 
  MapPin, 
  Building2, 
  Calendar,
  DollarSign,
  Eye, 
  Edit, 
  Check,
  X,
  Plus,
  Search,
  Filter,
  TrendingUp
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JobsManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const JobsManager: React.FC<JobsManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch jobs
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies(*),
          job_categories(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch job categories
  const { data: categories = [] } = useQuery({
    queryKey: ['job-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Job stats
  const jobStats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.status === 'open').length,
    pendingApproval: jobs.filter(j => j.status === 'pending').length,
    totalApplications: jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0)
  };

  // Update job status
  const updateJobMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({ title: 'Job updated successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update job', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const handleApproveJob = (id: string) => {
    updateJobMutation.mutate({ 
      id, 
      updates: { status: 'open', published_at: new Date().toISOString() }
    });
    logActivity('job_approved', { job_id: id });
  };

  const handleRejectJob = (id: string) => {
    updateJobMutation.mutate({ 
      id, 
      updates: { status: 'rejected' }
    });
    logActivity('job_rejected', { job_id: id });
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || job.category_id === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Jobs Management"
        description="Manage job postings, categories, and employment opportunities"
        icon={Briefcase}
        iconColor="text-blue-600"
        badge={{
          text: "Employment Hub",
          variant: "secondary"
        }}
        searchPlaceholder="Search jobs, companies..."
        onSearch={(query) => {
          setSearchTerm(query);
          logActivity('job_search', { query });
        }}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['jobs'] });
          logActivity('jobs_refresh', { timestamp: new Date() });
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="jobs">Job Listings</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Jobs"
              value={jobStats.totalJobs}
              description="All job postings"
              icon={Briefcase}
            />
            <StatCard
              title="Active Jobs"
              value={jobStats.activeJobs}
              description="Currently open"
              icon={TrendingUp}
            />
            <StatCard
              title="Pending Approval"
              value={jobStats.pendingApproval}
              description="Awaiting review"
              icon={Calendar}
            />
            <StatCard
              title="Total Applications"
              value={jobStats.totalApplications}
              description="All applications"
              icon={Users}
            />
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Input
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Jobs List */}
          <Card>
            <CardHeader>
              <CardTitle>Job Listings</CardTitle>
              <CardDescription>Manage job postings and employment opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">Loading jobs...</div>
                ) : filteredJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No jobs found</div>
                ) : (
                  filteredJobs.slice(0, 10).map((job) => (
                    <DataTableCard
                      key={job.id}
                      title={job.title}
                      subtitle={job.company_name}
                      status={{
                        label: job.status === 'open' ? 'Active' : job.status === 'pending' ? 'Pending' : 'Closed',
                        variant: job.status === 'open' ? 'default' : job.status === 'pending' ? 'outline' : 'secondary'
                      }}
                      tags={[
                        job.job_type,
                        job.experience_level,
                        job.is_remote ? 'Remote' : 'On-site'
                      ].filter(Boolean)}
                      metadata={[
                        { icon: MapPin, label: 'Location', value: job.location || 'N/A' },
                        { icon: Building2, label: 'Company', value: job.company_name || 'N/A' },
                        { icon: DollarSign, label: 'Salary', value: job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max} ${job.salary_currency}` : 'N/A' },
                        { icon: Users, label: 'Applications', value: `${job.applications_count || 0}` }
                      ]}
                      actions={[
                        {
                          label: 'View',
                          icon: Eye,
                          onClick: () => console.log('View job', job.id),
                          variant: 'outline'
                        },
                        ...(job.status === 'pending' ? [
                          {
                            label: 'Approve',
                            icon: Check,
                            onClick: () => handleApproveJob(job.id),
                            variant: 'default' as const
                          },
                          {
                            label: 'Reject',
                            icon: X,
                            onClick: () => handleRejectJob(job.id),
                            variant: 'destructive' as const
                          }
                        ] : []),
                        {
                          label: 'Edit',
                          icon: Edit,
                          onClick: () => console.log('Edit job', job.id),
                          variant: 'outline'
                        }
                      ]}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Categories</CardTitle>
              <CardDescription>Manage job categories and classifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Category Management</h3>
                <p className="text-muted-foreground">
                  Create and organize job categories for better classification
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>Review and manage job applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Application Management</h3>
                <p className="text-muted-foreground">
                  Track and process job applications from candidates
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employment Analytics</CardTitle>
              <CardDescription>Track job market trends and employment statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Market Intelligence</h3>
                <p className="text-muted-foreground">
                  Employment trends, salary insights, and market analysis
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};