import React, { useState } from 'react';
import { Users, DollarSign, TrendingUp, Send, MapPin, Heart, Building, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { RemittanceTracker } from '@/components/diaspora/RemittanceTracker';
import { ProjectCard } from '@/components/diaspora/ProjectCard';
import { useDiasporaProfile, useDiasporaProjects, useDiasporaEvents } from '@/hooks/useDiaspora';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const DiasporaDashboard = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useDiasporaProfile();
  const { data: projects, isLoading: projectsLoading } = useDiasporaProjects();
  const { data: events, isLoading: eventsLoading } = useDiasporaEvents();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <CardContent>
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Welcome to Diaspora Hub</h2>
            <p className="text-muted-foreground mb-6">
              Connect with your home village, track your contributions, and invest in community development.
            </p>
            <div className="space-y-2">
              <Button className="w-full">Sign In</Button>
              <Button variant="outline" className="w-full">Create Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold mb-4">
                Welcome to Your Diaspora Dashboard
              </h1>
              <p className="text-xl text-white/90 mb-6">
                Stay connected to your roots, track your impact, and help build a stronger Cameroon.
              </p>
              
              {profile ? (
                <div className="flex items-center gap-4">
                  <Badge className="bg-white/20 text-white border-none">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profile.country_of_residence}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-none">
                    <Heart className="h-4 w-4 mr-1" />
                    {profile.home_village_town_city}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-none">
                    <Award className="h-4 w-4 mr-1" />
                    Impact Score: {profile.impact_score}/100
                  </Badge>
                </div>
              ) : (
                <div className="flex gap-4">
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary">
                    Create Diaspora Profile
                  </Button>
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary">
                    Find Your Village
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <h3 className="font-semibold mb-4">Your Impact Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/80">Total Contributed</span>
                  <span className="font-bold">{formatCurrency(profile?.total_contributions_fcfa || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Projects Supported</span>
                  <span className="font-bold">{profile?.total_projects_supported || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Lives Impacted</span>
                  <span className="font-bold">{((profile?.total_contributions_fcfa || 0) / 10000).toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="remittances">Remittances</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Sent</p>
                      <p className="text-2xl font-bold">{formatCurrency(profile?.total_contributions_fcfa || 0)}</p>
                    </div>
                    <Send className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Projects</p>
                      <p className="text-2xl font-bold">{profile?.total_projects_supported || 0}</p>
                    </div>
                    <Building className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Impact Score</p>
                      <p className="text-2xl font-bold">{profile?.impact_score || 0}/100</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Projects</p>
                      <p className="text-2xl font-bold">{projects?.length || 0}</p>
                    </div>
                    <Award className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Contribution to Yaoundé Health Center</p>
                        <p className="text-sm text-muted-foreground">2 days ago • {formatCurrency(118000)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Village visit scheduled</p>
                        <p className="text-sm text-muted-foreground">1 week ago • Virtual tour</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Project milestone reached</p>
                        <p className="text-sm text-muted-foreground">2 weeks ago • Tech Hub 75% complete</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-auto p-4 flex flex-col gap-2">
                      <Send className="h-6 w-6" />
                      <span>Send Money</span>
                    </Button>
                    
                    <Link to="/villages">
                      <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2">
                        <MapPin className="h-6 w-6" />
                        <span>Find Village</span>
                      </Button>
                    </Link>
                    
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <Building className="h-6 w-6" />
                      <span>Browse Projects</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <Users className="h-6 w-6" />
                      <span>Join Community</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Featured Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Development Projects</CardTitle>
                <p className="text-muted-foreground">High-impact opportunities in your region</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects?.slice(0, 3).map((project) => (
                    <ProjectCard key={project.id} project={project} compact />
                  )) || (
                    <>
                      <div className="p-6 border rounded-lg">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-8 bg-muted rounded"></div>
                        </div>
                      </div>
                      <div className="p-6 border rounded-lg">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-8 bg-muted rounded"></div>
                        </div>
                      </div>
                      <div className="p-6 border rounded-lg">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-8 bg-muted rounded"></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="remittances">
            <RemittanceTracker diasporaProfileId={profile?.id} />
          </TabsContent>

          <TabsContent value="investments">
            <Card>
              <CardHeader>
                <CardTitle>Investment Portfolio</CardTitle>
                <p className="text-muted-foreground">
                  Track your investment returns and social impact
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-12">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Investment Portfolio Coming Soon</p>
                  <p>Track your village investments and returns in one place</p>
                  <Button className="mt-4">Get Early Access</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Available Projects</CardTitle>
                <p className="text-muted-foreground">
                  Discover high-impact development projects across Cameroon
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {projects?.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  )) || (
                    <div className="col-span-2 text-center text-muted-foreground py-12">
                      <Building className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No projects available at the moment</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle>Diaspora Community</CardTitle>
                <p className="text-muted-foreground">
                  Connect with fellow Cameroonians around the world
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Community Features Coming Soon</p>
                  <p>Chat, events, and networking with diaspora members</p>
                  <Button className="mt-4">Join Waitlist</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Diaspora Profile</CardTitle>
                <p className="text-muted-foreground">
                  Manage your profile and preferences
                </p>
              </CardHeader>
              <CardContent>
                {profile ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <p className="font-semibold">{profile.full_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Country of Residence</label>
                        <p className="font-semibold">{profile.country_of_residence}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Home Village/Town</label>
                        <p className="font-semibold">{profile.home_village_town_city}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Profession</label>
                        <p className="font-semibold">{profile.profession_sector}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Preferred Donation Areas</label>
                      <div className="flex gap-2 mt-2">
                        {profile.preferred_donation_interests?.map((interest: string) => (
                          <Badge key={interest} variant="outline">
                            {interest.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button>Update Profile</Button>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No Profile Found</p>
                    <p>Create your diaspora profile to get started</p>
                    <Button className="mt-4">Create Profile</Button>
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

export default DiasporaDashboard;