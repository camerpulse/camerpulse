import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, 
  TrendingUp, 
  Heart, 
  Users, 
  DollarSign,
  Star,
  Trophy,
  Medal,
  Crown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DiasporaRecognition = Database['public']['Tables']['diaspora_recognition']['Row'];
type DiasporaDonation = Database['public']['Tables']['diaspora_donations']['Row'];
type DiasporaProfile = Database['public']['Tables']['diaspora_profiles']['Row'];

interface ImpactStats {
  totalDonations: number;
  totalDonors: number;
  projectsSupported: number;
  topContributors: Array<{
    profile: DiasporaProfile;
    totalContribution: number;
    projectsSupported: number;
  }>;
}

export const WallOfImpact = () => {
  const [recognitions, setRecognitions] = useState<DiasporaRecognition[]>([]);
  const [impactStats, setImpactStats] = useState<ImpactStats>({
    totalDonations: 0,
    totalDonors: 0,
    projectsSupported: 0,
    topContributors: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImpactData();
  }, []);

  const fetchImpactData = async () => {
    try {
      // Fetch recognition data
      const { data: recognitionData } = await supabase
        .from('diaspora_recognition')
        .select(`
          *,
          diaspora_profiles (
            full_name,
            country_of_residence,
            home_village_town_city
          )
        `)
        .eq('public_display', true)
        .order('achievement_date', { ascending: false })
        .limit(20);

      if (recognitionData) {
        setRecognitions(recognitionData);
      }

      // Fetch overall impact statistics
      const { data: donationsData } = await supabase
        .from('diaspora_donations')
        .select(`
          amount_fcfa,
          diaspora_profile_id,
          project_id,
          diaspora_profiles (
            full_name,
            country_of_residence,
            home_village_town_city
          )
        `)
        .eq('donation_status', 'completed');

      if (donationsData) {
        const totalDonations = donationsData.reduce((sum, donation) => sum + donation.amount_fcfa, 0);
        const uniqueDonors = new Set(donationsData.map(d => d.diaspora_profile_id)).size;
        const uniqueProjects = new Set(donationsData.map(d => d.project_id)).size;

        // Calculate top contributors
        const contributorMap = new Map();
        donationsData.forEach(donation => {
          const profileId = donation.diaspora_profile_id;
          if (!contributorMap.has(profileId)) {
            contributorMap.set(profileId, {
              profile: donation.diaspora_profiles,
              totalContribution: 0,
              projectsSupported: new Set()
            });
          }
          const contributor = contributorMap.get(profileId);
          contributor.totalContribution += donation.amount_fcfa;
          contributor.projectsSupported.add(donation.project_id);
        });

        const topContributors = Array.from(contributorMap.values())
          .map(contributor => ({
            ...contributor,
            projectsSupported: contributor.projectsSupported.size
          }))
          .sort((a, b) => b.totalContribution - a.totalContribution)
          .slice(0, 10);

        setImpactStats({
          totalDonations,
          totalDonors: uniqueDonors,
          projectsSupported: uniqueProjects,
          topContributors
        });
      }

    } catch (error) {
      console.error('Error fetching impact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecognitionIcon = (type: string) => {
    switch (type) {
      case 'top_donor':
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 'consistent_supporter':
        return <Trophy className="h-6 w-6 text-blue-500" />;
      case 'community_leader':
        return <Medal className="h-6 w-6 text-purple-500" />;
      case 'milestone_achievement':
        return <Star className="h-6 w-6 text-green-500" />;
      default:
        return <Award className="h-6 w-6 text-orange-500" />;
    }
  };

  const getRecognitionLevel = (level: string) => {
    switch (level) {
      case 'platinum':
        return { color: 'bg-gradient-to-r from-gray-300 to-gray-400', text: 'Platinum' };
      case 'gold':
        return { color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', text: 'Gold' };
      case 'silver':
        return { color: 'bg-gradient-to-r from-gray-200 to-gray-300', text: 'Silver' };
      case 'bronze':
        return { color: 'bg-gradient-to-r from-orange-400 to-orange-600', text: 'Bronze' };
      default:
        return { color: 'bg-primary', text: 'Recognition' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Wall of Impact
          </h1>
          <p className="text-muted-foreground">
            Celebrating the contributions and achievements of our diaspora community
          </p>
        </div>

        {/* Impact Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {impactStats.totalDonations.toLocaleString()} FCFA
              </h3>
              <p className="text-muted-foreground">Total Donations</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {impactStats.totalDonors}
              </h3>
              <p className="text-muted-foreground">Active Donors</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {impactStats.projectsSupported}
              </h3>
              <p className="text-muted-foreground">Projects Supported</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recognition" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recognition">Recognition Wall</TabsTrigger>
            <TabsTrigger value="leaderboard">Top Contributors</TabsTrigger>
            <TabsTrigger value="milestones">Community Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="recognition" className="space-y-6">
            {recognitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recognitions.map((recognition) => {
                  const level = getRecognitionLevel(recognition.recognition_level);
                  return (
                    <Card key={recognition.id} className="relative overflow-hidden">
                      <div className={`absolute top-0 left-0 right-0 h-1 ${level.color}`} />
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          {getRecognitionIcon(recognition.recognition_type)}
                          <Badge variant="secondary">{level.text}</Badge>
                        </div>
                        <CardTitle className="text-lg">{recognition.recognition_title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {recognition.recognition_description}
                        </p>
                        
                        <div className="border-t pt-3">
                          <p className="font-medium text-sm">
                            {(recognition as any).diaspora_profiles?.full_name || 'Anonymous Contributor'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(recognition as any).diaspora_profiles?.country_of_residence}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(recognition.achievement_date).toLocaleDateString()}
                          </p>
                        </div>

                        {recognition.points_awarded > 0 && (
                          <Badge variant="outline" className="w-fit">
                            <Star className="h-3 w-3 mr-1" />
                            {recognition.points_awarded} points
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Recognition Yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to make an impact and earn recognition!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {impactStats.topContributors.length > 0 ? (
                  <div className="space-y-4">
                    {impactStats.topContributors.map((contributor, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">
                              {contributor.profile?.full_name || 'Anonymous'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {contributor.profile?.country_of_residence}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {contributor.totalContribution.toLocaleString()} FCFA
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {contributor.projectsSupported} projects
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No contributors yet. Be the first to make a difference!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones">
            <Card>
              <CardHeader>
                <CardTitle>Community Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Community milestones and achievements will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};