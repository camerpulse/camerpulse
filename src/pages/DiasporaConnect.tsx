import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Users, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award, 
  Heart,
  MapPin,
  DollarSign,
  Star
} from 'lucide-react';
import { useDiasporaStats, useDiasporaProfile, useInvestmentProjects, useDiasporaEvents, useDiasporaRecognition } from '@/hooks/useDiaspora';
import { useAuth } from '@/hooks/useAuth';
import { DiasporaProfileSetup } from '@/components/diaspora/DiasporaProfileSetup';
import { ProjectCard } from '@/components/diaspora/ProjectCard';
import { EventCard } from '@/components/diaspora/EventCard';
import { RecognitionCard } from '@/components/diaspora/RecognitionCard';
import { DonationWidget } from '@/components/diaspora/DonationWidget';



export const DiasporaConnect = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: stats } = useDiasporaStats();
  const { data: profile } = useDiasporaProfile(user?.id);
  const { data: projects } = useInvestmentProjects({ status: 'fundraising' });
  const { data: events } = useDiasporaEvents({ upcoming: true });
  const { data: recognition } = useDiasporaRecognition();

  // If user doesn't have a diaspora profile, show setup
  if (user && !profile) {
    return <DiasporaProfileSetup />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            CamerPulse DiasporaConnect
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empowering Cameroonians abroad to engage civically and invest in national development
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Active Members</p>
                  <p className="text-3xl font-bold">{stats?.totalMembers?.toLocaleString() || 0}</p>
                </div>
                <Users className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Projects Funded</p>
                  <p className="text-3xl font-bold">{stats?.projectsFunded || 0}</p>
                </div>
                <Target className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Raised</p>
                  <p className="text-3xl font-bold">{(stats?.totalRaised || 0).toLocaleString()} FCFA</p>
                </div>
                <TrendingUp className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Active Projects</p>
                  <p className="text-3xl font-bold">{stats?.totalProjects || 0}</p>
                </div>
                <Globe className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="recognition">Recognition</TabsTrigger>
            <TabsTrigger value="donate">Donate</TabsTrigger>
            <TabsTrigger value="dashboard">My Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Featured Projects */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Featured Projects
                  </CardTitle>
                  <CardDescription>
                    High-impact projects seeking diaspora investment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects?.slice(0, 3).map((project) => (
                      <ProjectCard key={project.id} project={project} compact />
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('projects')}>
                    View All Projects
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription>
                    Virtual town halls and community summits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events?.slice(0, 3).map((event) => (
                      <EventCard key={event.id} event={event} compact />
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('events')}>
                    View All Events
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Community Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Community Impact
                </CardTitle>
                <CardDescription>
                  Recent achievements from our diaspora community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recognition?.slice(0, 6).map((item) => (
                    <RecognitionCard key={item.id} recognition={item} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Investment Projects</CardTitle>
                <CardDescription>
                  Verified development projects seeking diaspora investment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects?.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Diaspora Events</CardTitle>
                <CardDescription>
                  Virtual town halls, summits, and community engagement events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events?.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recognition">
            <Card>
              <CardHeader>
                <CardTitle>Wall of Impact</CardTitle>
                <CardDescription>
                  Celebrating diaspora contributions to national development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recognition?.map((item) => (
                    <RecognitionCard key={item.id} recognition={item} detailed />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donate">
            <DonationWidget profile={profile} />
          </TabsContent>

          <TabsContent value="dashboard">
            {profile && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium">{profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">{profile.country_of_residence}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Home Location</p>
                      <p className="font-medium">{profile.home_village_town_city}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={profile.verification_status === 'verified' ? 'default' : 'secondary'}>
                        {profile.verification_status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Impact Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>My Impact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Contributions</span>
                      <span className="font-bold">{profile.total_contributions_fcfa.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Projects Supported</span>
                      <span className="font-bold">{profile.total_projects_supported}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Impact Score</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold">{profile.impact_score}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" onClick={() => setActiveTab('donate')}>
                      <Heart className="h-4 w-4 mr-2" />
                      Make a Donation
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab('projects')}>
                      <Target className="h-4 w-4 mr-2" />
                      Browse Projects
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab('events')}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Join Events
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};