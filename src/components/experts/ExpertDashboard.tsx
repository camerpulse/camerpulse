import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useExperts } from '@/hooks/useExperts';
import { ExpertProfileForm } from '@/components/experts/ExpertProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';
import { 
  User, 
  Plus, 
  Star, 
  Briefcase, 
  TrendingUp,
  DollarSign,
  Eye,
  MessageCircle,
  Clock
} from 'lucide-react';

interface ExpertDashboardProps {
  expertProfile: any;
  onCreateProfile?: () => void;
}

export const ExpertDashboard: React.FC<ExpertDashboardProps> = ({ expertProfile, onCreateProfile }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showEditForm, setShowEditForm] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!expertProfile?.id) return;
      
      try {
        setLoading(true);
        // Load proposals and projects data here
        // This would be implemented with actual API calls
        setProposals([]);
        setProjects([]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [expertProfile?.id]);

  const getProfileCompletionPercentage = () => {
    if (!expertProfile) return 0;
    
    let completed = 0;
    const total = 10;
    
    if (expertProfile.professional_title) completed++;
    if (expertProfile.bio && expertProfile.bio.length > 50) completed++;
    if (expertProfile.hourly_rate_min || expertProfile.hourly_rate_max) completed++;
    if (expertProfile.skills && expertProfile.skills.length > 2) completed++;
    if (expertProfile.location) completed++;
    if (expertProfile.portfolio_items && expertProfile.portfolio_items.length > 0) completed++;
    if (expertProfile.education && expertProfile.education.length > 0) completed++;
    if (expertProfile.years_experience > 0) completed++;
    if (expertProfile.languages && expertProfile.languages.length > 1) completed++;
    if (expertProfile.certifications && expertProfile.certifications.length > 0) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const stats = {
    profileViews: expertProfile?.profile_views || 0,
    totalProjects: expertProfile?.total_projects || 0,
    averageRating: expertProfile?.average_rating || 0,
    totalReviews: expertProfile?.total_reviews || 0,
    responseTime: expertProfile?.response_time_hours || 24,
    profileCompletion: getProfileCompletionPercentage()
  };

  if (showEditForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setShowEditForm(false)}
            className="flex items-center gap-2"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <ExpertProfileForm 
          existingProfile={expertProfile}
          onSuccess={() => {
            setShowEditForm(false);
            queryClient.invalidateQueries({ queryKey: ['expert-profile'] });
            // The profile will be refreshed automatically via React Query
          }}
        />
      </div>
    );
  }

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
      {/* Expert Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{expertProfile.professional_title}</h1>
            <p className="text-muted-foreground">
              {expertProfile.location} • {expertProfile.availability?.replace('_', ' ')}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {expertProfile.is_verified && (
                <Badge variant="default">Verified Expert</Badge>
              )}
              {expertProfile.is_featured && (
                <Badge variant="secondary">Featured</Badge>
              )}
              <Badge variant="outline">
                {stats.profileCompletion}% Complete
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditForm(true)}>
            Edit Profile
          </Button>
          <Button onClick={onCreateProfile} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            View Public Profile
          </Button>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {stats.profileCompletion < 80 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-800">Complete Your Profile</h3>
                <p className="text-orange-700">
                  Your profile is {stats.profileCompletion}% complete. Complete it to attract more clients and improve your visibility.
                </p>
                <Button variant="outline" className="mt-2" onClick={() => setShowEditForm(true)}>
                  Complete Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Eye className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.profileViews}</p>
                <p className="text-sm text-muted-foreground">Profile Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Briefcase className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
                <p className="text-sm text-muted-foreground">Projects Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">
                  Average Rating ({stats.totalReviews} reviews)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.responseTime}h</p>
                <p className="text-sm text-muted-foreground">Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="projects">Active Projects</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest interactions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm">Start applying to projects to see activity here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Performance</CardTitle>
                <CardDescription>How your profile is performing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Profile Completion</span>
                    <span className="text-sm font-medium">{stats.profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.profileCompletion}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-sm">This Month</span>
                    <span className="text-sm font-medium">{stats.profileViews} views</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Proposals</CardTitle>
              <CardDescription>Proposals you've submitted to clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No proposals yet</p>
                <p className="text-sm">Browse projects and submit your first proposal</p>
                <Button variant="outline" className="mt-4">
                  Find Projects
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Projects you're currently working on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active projects</p>
                <p className="text-sm">Accepted proposals will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>Your earnings and payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No earnings yet</p>
                <p className="text-sm">Complete projects to start earning</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};