import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Building2, Briefcase, MessageSquare, BarChart3, Settings } from 'lucide-react';
import CompanyJobs from '@/components/companies/CompanyJobs';
import CompanyUpdates from '@/components/companies/CompanyUpdates';

interface Company {
  id: string;
  company_name: string;
  sector: string;
  description: string;
  status: string;
  average_rating: number;
  total_ratings: number;
  logo_url?: string;
  created_at: string;
}

interface CompanyStats {
  profile_views: number;
  job_posts: number;
  updates: number;
  avg_rating: number;
}

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [stats, setStats] = useState<CompanyStats>({
    profile_views: 0,
    job_posts: 0,
    updates: 0,
    avg_rating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCompanyData();
    }
  }, [user]);

  const fetchCompanyData = async () => {
    try {
      if (!user?.id) return;

      // Fetch company owned by current user using raw query to avoid type issues
      const { data, error } = await (supabase as any)
        .from('companies')
        .select('id, company_name, sector, description, status, average_rating, total_ratings, logo_url, created_at')
        .eq('owner_id', user.id)
        .eq('status', 'approved')
        .maybeSingle();

      if (error) {
        console.error('Company fetch error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch company data",
          variant: "destructive"
        });
        return;
      }

      const companyData = data as Company | null;
      setCompany(companyData);

      if (companyData) {
        // Fetch statistics
        const jobsResponse = await (supabase as any)
          .from('company_jobs')
          .select('id')
          .eq('company_id', companyData.id)
          .eq('is_active', true);

        const updatesResponse = await (supabase as any)
          .from('company_updates')
          .select('id')
          .eq('company_id', companyData.id);

        setStats({
          profile_views: 0,
          job_posts: jobsResponse.data?.length || 0,
          updates: updatesResponse.data?.length || 0,
          avg_rating: companyData.average_rating || 0
        });
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-muted">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!company) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>No Company Found</CardTitle>
              <CardDescription>
                You don't have a registered company yet or your company is pending approval.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link to="/companies/register">Register Your Company</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={`${company.company_name} logo`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-foreground">{company.company_name}</h1>
                <p className="text-text-muted">{company.sector}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{company.status}</Badge>
                  <span className="text-sm text-text-muted">
                    ⭐ {company.average_rating.toFixed(1)} ({company.total_ratings} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-2xl font-bold">{stats.profile_views}</p>
                    <p className="text-xs text-muted-foreground">Profile Views</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-2xl font-bold">{stats.job_posts}</p>
                    <p className="text-xs text-muted-foreground">Active Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-2xl font-bold">{stats.updates}</p>
                    <p className="text-xs text-muted-foreground">Updates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="ml-2">
                    <p className="text-2xl font-bold">⭐ {stats.avg_rating.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Average Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="jobs" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="jobs">Job Posts</TabsTrigger>
              <TabsTrigger value="updates">Company Updates</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="jobs">
              <CompanyJobs companyId={company.id} />
            </TabsContent>
            
            <TabsContent value="updates">
              <CompanyUpdates companyId={company.id} />
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Company Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your company profile and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button variant="outline" asChild>
                      <a href={`/companies/${company.id}/edit`}>Edit Company Profile</a>
                    </Button>
                    <div className="text-sm text-text-muted">
                      <p>Company ID: {company.id}</p>
                      <p>Registered: {new Date(company.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default CompanyDashboard;