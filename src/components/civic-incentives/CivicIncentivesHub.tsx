import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Gift, Trophy, Users, Star, Calendar, DollarSign, GraduationCap } from 'lucide-react';
import { GrantProgramsList } from './GrantProgramsList';
import { ScholarshipTracker } from './ScholarshipTracker';
import { RewardsEngine } from './RewardsEngine';
import { CivicLeaderboards } from './CivicLeaderboards';
import { ApplicationTracker } from './ApplicationTracker';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCivicMetrics, useUserCivicRewards } from '@/hooks/useCivicIncentives';

export const CivicIncentivesHub: React.FC = () => {
  const { user } = useAuth();
  const { data: userMetrics } = useUserCivicMetrics(user?.id);
  const { data: userRewards } = useUserCivicRewards(user?.id);

  const stats = [
    {
      title: "Civic Score",
      value: userMetrics?.total_civic_score || 0,
      icon: Star,
      color: "text-yellow-600"
    },
    {
      title: "Badges Earned",
      value: userMetrics?.badges_earned || 0,
      icon: Award,
      color: "text-blue-600"
    },
    {
      title: "Grants Received",
      value: userMetrics?.grants_received || 0,
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Current Rank",
      value: userMetrics?.rank_overall || "Unranked",
      icon: Trophy,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            CamerPulse Civic Incentives
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering civic engagement through grants, scholarships, and rewards. 
            Build your civic reputation and unlock opportunities to drive positive change in Cameroon.
          </p>
        </div>

        {/* User Stats Dashboard */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="grants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="grants" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Grants
            </TabsTrigger>
            <TabsTrigger value="scholarships" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Scholarships
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="leaderboards" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboards
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              My Applications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grants" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GrantProgramsList />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      Grant Programs Available
                    </CardTitle>
                    <CardDescription>
                      Explore funding opportunities for your civic initiatives
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Youth Innovation</span>
                        <Badge variant="secondary">3 Open</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Village Development</span>
                        <Badge variant="secondary">2 Open</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Startup Incubation</span>
                        <Badge variant="secondary">1 Open</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Diaspora Matching Fund</CardTitle>
                    <CardDescription>
                      Connect your village projects with diaspora support
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Village development projects can receive up to 50% matching funds from diaspora contributors.
                    </p>
                    <Button variant="outline" className="w-full">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scholarships" className="space-y-6">
            <ScholarshipTracker />
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <RewardsEngine />
          </TabsContent>

          <TabsContent value="leaderboards" className="space-y-6">
            <CivicLeaderboards />
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            {user ? (
              <ApplicationTracker userId={user.id} />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Please log in to view your applications
                  </p>
                  <Button>Log In</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Call to Action Section */}
        <div className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to Make an Impact?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of civic champions building a better Cameroon. 
            Start your journey by exploring grants, earning rewards, and connecting with your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="min-w-[200px]">
              Apply for Grants
            </Button>
            <Button size="lg" variant="outline" className="min-w-[200px]">
              View Scholarships
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};