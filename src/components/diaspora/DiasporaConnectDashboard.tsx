import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Heart, 
  Users, 
  Trophy, 
  Calendar,
  MapPin,
  DollarSign,
  Star,
  TrendingUp,
  Building,
  Handshake
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DiasporaProfileForm } from './DiasporaProfileForm';
import { DonationEngine } from './DonationEngine';
import { WallOfImpact } from './WallOfImpact';
import { DiasporaEvents } from './DiasporaEvents';
import { ProjectsDirectory } from './ProjectsDirectory';

interface DiasporaProfile {
  id: string;
  full_name: string;
  country_of_residence: string;
  home_village_town_city: string;
  home_region: string;
  profession_sector?: string;
  is_verified: boolean;
  created_at: string;
}

interface DiasporaStats {
  totalDonations: number;
  projectsSupported: number;
  communitiesImpacted: number;
  eventsAttended: number;
}

export const DiasporaConnectDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DiasporaProfile | null>(null);
  const [stats, setStats] = useState<DiasporaStats>({
    totalDonations: 0,
    projectsSupported: 0,
    communitiesImpacted: 0,
    eventsAttended: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchDiasporaProfile();
      fetchUserStats();
    }
  }, [user]);

  const fetchDiasporaProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('diaspora_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching diaspora profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Get donations
      const { data: donations } = await supabase
        .from('diaspora_donations')
        .select('amount_fcfa, target_id')
        .eq('donor_id', profile?.id)
        .eq('status', 'completed');

      // Get event registrations
      const { data: events } = await supabase
        .from('diaspora_event_registrations')
        .select('id')
        .eq('diaspora_id', profile?.id)
        .eq('attendance_status', 'attended');

      const totalDonations = donations?.reduce((sum, d) => sum + (d.amount_fcfa || 0), 0) || 0;
      const projectsSupported = new Set(donations?.map(d => d.target_id)).size || 0;

      setStats({
        totalDonations,
        projectsSupported,
        communitiesImpacted: projectsSupported, // Simplified calculation
        eventsAttended: events?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleProfileUpdate = () => {
    fetchDiasporaProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading diaspora dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <Globe className="mx-auto h-16 w-16 text-primary mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Welcome to Diaspora Connect
            </h1>
            <p className="text-muted-foreground mb-8">
              Connect with your home community, support development projects, and make a lasting impact from anywhere in the world.
            </p>
          </div>
          
          <DiasporaProfileForm onSuccess={handleProfileUpdate} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {profile.full_name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.country_of_residence}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  Home: {profile.home_village_town_city}, {profile.home_region}
                </div>
                {profile.is_verified && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={() => setActiveTab('profile')}>
              Update Profile
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Contributions</p>
                  <p className="text-2xl font-bold">{(stats.totalDonations / 1000000).toFixed(1)}M FCFA</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Projects Supported</p>
                  <p className="text-2xl font-bold">{stats.projectsSupported}</p>
                </div>
                <Building className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Communities Impacted</p>
                  <p className="text-2xl font-bold">{stats.communitiesImpacted}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Events Attended</p>
                  <p className="text-2xl font-bold">{stats.eventsAttended}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="donate">Donate</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="recognition">Recognition</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Handshake className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('donate')}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Make a Donation
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('projects')}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Browse Projects
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('events')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Join Events
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div>Welcome to Diaspora Connect! Start by exploring projects in your home region.</div>
                    <div>Complete your profile verification to unlock more features.</div>
                    <div>Join upcoming virtual town halls to connect with fellow diaspora members.</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Home Region Highlights */}
            <Card>
              <CardHeader>
                <CardTitle>Highlights from {profile.home_region}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4" />
                  <p>Stay connected with development in your home region.</p>
                  <p className="text-sm mt-2">Recent projects and community updates will appear here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donate">
            <DonationEngine diasporaProfile={profile} onDonationSuccess={fetchUserStats} />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsDirectory homeRegion={profile.home_region} />
          </TabsContent>

          <TabsContent value="events">
            <DiasporaEvents diasporaProfile={profile} />
          </TabsContent>

          <TabsContent value="recognition">
            <WallOfImpact />
          </TabsContent>

          <TabsContent value="profile">
            <DiasporaProfileForm 
              existingProfile={profile} 
              onSuccess={handleProfileUpdate} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};