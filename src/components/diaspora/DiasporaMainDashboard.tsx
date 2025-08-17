import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp, 
  Award,
  MapPin,
  Building2,
  Clock,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type DiasporaProfile = Database['public']['Tables']['diaspora_profiles']['Row'];
type DiasporaDonation = Database['public']['Tables']['diaspora_donations']['Row'];
type DiasporaEvent = Database['public']['Tables']['diaspora_events']['Row'];
type InvestmentProject = Database['public']['Tables']['diaspora_investment_projects']['Row'];

export const DiasporaMainDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DiasporaProfile | null>(null);
  const [donations, setDonations] = useState<DiasporaDonation[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<DiasporaEvent[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<InvestmentProject[]>([]);
  const [stats, setStats] = useState({
    totalDonated: 0,
    projectsSupported: 0,
    eventsAttended: 0,
    impactScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch diaspora profile
      const { data: profileData } = await supabase
        .from('diaspora_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);

      // Fetch donations
      const { data: donationsData } = await supabase
        .from('diaspora_donations')
        .select('*')
        .eq('diaspora_profile_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
        if (donationsData) {
          setDonations(donationsData);
          const totalDonated = donationsData.reduce((sum, donation) => sum + donation.amount_fcfa, 0);
          setStats(prev => ({ ...prev, totalDonated, projectsSupported: donationsData.length }));
        }
      }

      // Fetch upcoming events
      const { data: eventsData } = await supabase
        .from('diaspora_events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .eq('event_status', 'active')
        .order('event_date', { ascending: true })
        .limit(3);
      
      if (eventsData) {
        setUpcomingEvents(eventsData);
      }

      // Fetch featured projects
      const { data: projectsData } = await supabase
        .from('diaspora_investment_projects')
        .select('*')
        .eq('project_status', 'active')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (projectsData) {
        setFeaturedProjects(projectsData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Create Your Diaspora Profile</h2>
              <p className="text-muted-foreground mb-6">
                You need to create a diaspora profile to access the dashboard.
              </p>
              <Button onClick={() => navigateTo('/diaspora/profile')}>Create Profile</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {profile.full_name}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {profile.country_of_residence} • {profile.home_village_town_city}
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Star className="h-4 w-4 mr-2" />
              Impact Score: {profile.impact_score}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Donated</p>
                  <p className="text-2xl font-bold">{stats.totalDonated.toLocaleString()} FCFA</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projects Supported</p>
                  <p className="text-2xl font-bold">{stats.projectsSupported}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Events Attended</p>
                  <p className="text-2xl font-bold">{stats.eventsAttended}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Impact Score</p>
                  <p className="text-2xl font-bold">{profile.impact_score}</p>
                </div>
                <Award className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="donations">My Donations</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Donations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Recent Donations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {donations.length > 0 ? (
                    <div className="space-y-4">
                      {donations.slice(0, 3).map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{donation.donation_message || 'Anonymous Donation'}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(donation.created_at!).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">{donation.amount_fcfa.toLocaleString()} FCFA</Badge>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full">View All Donations</Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No donations yet</p>
                      <Button className="mt-4">Make Your First Donation</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(event.event_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.duration_minutes}min
                            </span>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full">View All Events</Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No upcoming events</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Featured Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Featured Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredProjects.map((project) => (
                    <div key={project.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{project.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{project.completion_percentage}%</span>
                        </div>
                        <Progress value={project.completion_percentage} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Raised: {project.raised_amount_fcfa.toLocaleString()} FCFA</span>
                          <span>Target: {project.target_amount_fcfa.toLocaleString()} FCFA</span>
                        </div>
                      </div>
                      <Button className="w-full mt-3" size="sm">Support Project</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>My Donation History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Donation history will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Investment Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Project directory will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Diaspora Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Events calendar will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};