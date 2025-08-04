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
  Music, 
  Users, 
  Star, 
  Award, 
  Mic,
  HeadphonesIcon,
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

interface ArtistManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const ArtistManager: React.FC<ArtistManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');

  // Fetch artist applications
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['artist-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artist_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch artist memberships
  const { data: memberships = [] } = useQuery({
    queryKey: ['artist-memberships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artist_memberships')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Artist stats
  const artistStats = {
    totalApplications: applications.length,
    approvedArtists: applications.filter(a => a.application_status === 'approved').length,
    pendingReview: applications.filter(a => a.application_status === 'submitted').length,
    activeMemberships: memberships.filter(m => m.membership_active).length
  };

  // Update application status
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('artist_applications')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-applications'] });
      toast({ title: 'Application updated successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update application', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const handleApproveApplication = (id: string) => {
    updateApplicationMutation.mutate({ 
      id, 
      updates: { 
        application_status: 'approved',
        verified_at: new Date().toISOString()
      }
    });
    logActivity('artist_application_approved', { application_id: id });
  };

  const handleRejectApplication = (id: string, reason?: string) => {
    updateApplicationMutation.mutate({ 
      id, 
      updates: { 
        application_status: 'rejected',
        rejection_reason: reason || 'Application does not meet requirements'
      }
    });
    logActivity('artist_application_rejected', { application_id: id, reason });
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.stage_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.real_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.application_status === statusFilter;
    const matchesGenre = genreFilter === 'all' || (app.genres && app.genres.includes(genreFilter));
    return matchesSearch && matchesStatus && matchesGenre;
  });

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Artist Management"
        description="Manage artist applications, memberships, and creative community"
        icon={Music}
        iconColor="text-purple-600"
        badge={{
          text: "Creative Hub",
          variant: "secondary"
        }}
        searchPlaceholder="Search artists, stage names..."
        onSearch={(query) => {
          setSearchTerm(query);
          logActivity('artist_search', { query });
        }}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['artist-applications'] });
          logActivity('artist_refresh', { timestamp: new Date() });
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="memberships">Memberships</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Applications"
              value={artistStats.totalApplications}
              description="All submissions"
              icon={Music}
            />
            <StatCard
              title="Approved Artists"
              value={artistStats.approvedArtists}
              description="Verified members"
              icon={Award}
            />
            <StatCard
              title="Pending Review"
              value={artistStats.pendingReview}
              description="Awaiting approval"
              icon={Users}
            />
            <StatCard
              title="Active Memberships"
              value={artistStats.activeMemberships}
              description="Current members"
              icon={Star}
            />
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Input
                    placeholder="Search artists..."
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
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    <SelectItem value="afrobeats">Afrobeats</SelectItem>
                    <SelectItem value="hip-hop">Hip Hop</SelectItem>
                    <SelectItem value="gospel">Gospel</SelectItem>
                    <SelectItem value="traditional">Traditional</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setGenreFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          <Card>
            <CardHeader>
              <CardTitle>Artist Applications</CardTitle>
              <CardDescription>Review and approve artist membership applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">Loading applications...</div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No applications found</div>
                ) : (
                  filteredApplications.slice(0, 10).map((application) => (
                    <DataTableCard
                      key={application.id}
                      title={application.stage_name}
                      subtitle={`Real Name: ${application.real_name}`}
                      status={{
                        label: application.application_status === 'approved' ? 'Approved' : 
                               application.application_status === 'submitted' ? 'Pending' : 'Rejected',
                        variant: application.application_status === 'approved' ? 'default' : 
                                application.application_status === 'submitted' ? 'outline' : 'destructive'
                      }}
                      tags={application.genres || []}
                      metadata={[
                        { icon: Mic, label: 'Genres', value: application.genres?.join(', ') || 'N/A' },
                        { icon: Users, label: 'Region', value: application.region || 'N/A' },
                        { icon: HeadphonesIcon, label: 'Languages', value: application.languages_spoken?.join(', ') || 'N/A' },
                        { icon: Star, label: 'Payment', value: application.payment_status || 'N/A' }
                      ]}
                      actions={[
                        {
                          label: 'View',
                          icon: Eye,
                          onClick: () => console.log('View application', application.id),
                          variant: 'outline'
                        },
                        ...(application.application_status === 'submitted' ? [
                          {
                            label: 'Approve',
                            icon: Check,
                            onClick: () => handleApproveApplication(application.id),
                            variant: 'default' as const
                          },
                          {
                            label: 'Reject',
                            icon: X,
                            onClick: () => handleRejectApplication(application.id),
                            variant: 'destructive' as const
                          }
                        ] : []),
                        {
                          label: 'Edit',
                          icon: Edit,
                          onClick: () => console.log('Edit application', application.id),
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

        <TabsContent value="memberships" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Artist Memberships</CardTitle>
              <CardDescription>Manage active artist memberships and benefits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Membership Management</h3>
                <p className="text-muted-foreground">
                  Track membership status, benefits, and renewals
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Artist Content</CardTitle>
              <CardDescription>Manage artist profiles, music, and creative content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <HeadphonesIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Content Management</h3>
                <p className="text-muted-foreground">
                  Oversee music uploads, profiles, and creative works
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Artist Analytics</CardTitle>
              <CardDescription>Track artist performance and community growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Performance Insights</h3>
                <p className="text-muted-foreground">
                  Artist engagement, streaming data, and community metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};