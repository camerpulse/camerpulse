import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Crown, 
  Medal,
  Heart,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DiasporaRecognition {
  id: string;
  diaspora_id: string;
  recognition_type: string;
  recognition_title: string;
  recognition_description: string;
  recognition_period: string;
  ranking_position: number;
  total_contribution_fcfa: number;
  projects_supported: number;
  communities_impacted: number;
  recognition_date: string;
  is_featured: boolean;
  diaspora_profiles: {
    full_name: string;
    country_of_residence: string;
    home_region: string;
  };
}

interface LeaderboardEntry {
  full_name: string;
  country_of_residence: string;
  home_region: string;
  total_contributions: number;
  projects_supported: number;
  ranking: number;
}

export const WallOfImpact: React.FC = () => {
  const [recognitions, setRecognitions] = useState<DiasporaRecognition[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monthly');

  useEffect(() => {
    fetchRecognitions();
    fetchLeaderboard();
  }, [activeTab]);

  const fetchRecognitions = async () => {
    try {
      const { data, error } = await supabase
        .from('diaspora_recognition')
        .select(`
          *,
          diaspora_profiles (
            full_name,
            country_of_residence,
            home_region
          )
        `)
        .eq('recognition_period', activeTab)
        .order('ranking_position', { ascending: true })
        .limit(20);

      if (error) throw error;
      setRecognitions(data || []);
    } catch (error) {
      console.error('Error fetching recognitions:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // This would be a more complex query in reality
      const { data, error } = await supabase
        .from('diaspora_profiles')
        .select(`
          full_name,
          country_of_residence,
          home_region,
          diaspora_donations (
            amount_fcfa,
            target_id
          )
        `)
        .eq('diaspora_donations.status', 'completed')
        .limit(10);

      if (error) throw error;
      
      // Process data for leaderboard
      const processed = (data || []).map((profile: any, index: number) => {
        const donations = profile.diaspora_donations || [];
        const totalContributions = donations.reduce((sum: number, d: any) => sum + (d.amount_fcfa || 0), 0);
        const projectsSupported = new Set(donations.map((d: any) => d.target_id)).size;
        
        return {
          full_name: profile.full_name,
          country_of_residence: profile.country_of_residence,
          home_region: profile.home_region,
          total_contributions: totalContributions,
          projects_supported: projectsSupported,
          ranking: index + 1
        };
      }).sort((a, b) => b.total_contributions - a.total_contributions);

      setLeaderboard(processed);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Trophy className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading recognition data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Wall of Impact</h2>
        <p className="text-muted-foreground">
          Celebrating our diaspora champions who are making a difference
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monthly">This Month</TabsTrigger>
          <TabsTrigger value="quarterly">Quarter</TabsTrigger>
          <TabsTrigger value="yearly">Year</TabsTrigger>
          <TabsTrigger value="lifetime">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Top Contributors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Contributors - {activeTab === 'monthly' ? 'This Month' : activeTab === 'quarterly' ? 'This Quarter' : activeTab === 'yearly' ? 'This Year' : 'All Time'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4" />
                  <p>No contributors found for this period.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getRankingIcon(entry.ranking)}
                          <span className="font-semibold text-lg">#{entry.ranking}</span>
                        </div>
                        
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(entry.full_name)}</AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h4 className="font-semibold">{entry.full_name}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{entry.country_of_residence}</span>
                            <span>•</span>
                            <span>Home: {entry.home_region}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-semibold">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(entry.total_contributions)} FCFA
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {entry.projects_supported} projects supported
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Special Recognition */}
          {recognitions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recognitions.map(recognition => (
                <Card key={recognition.id} className={recognition.is_featured ? 'border-primary' : ''}>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        {recognition.recognition_type === 'civic_hero' && (
                          <Crown className="h-12 w-12 text-yellow-500" />
                        )}
                        {recognition.recognition_type === 'village_builder' && (
                          <Medal className="h-12 w-12 text-blue-500" />
                        )}
                        {recognition.recognition_type === 'top_donor' && (
                          <Heart className="h-12 w-12 text-red-500" />
                        )}
                        {recognition.recognition_type === 'wall_of_impact' && (
                          <Star className="h-12 w-12 text-purple-500" />
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg">{recognition.diaspora_profiles.full_name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {recognition.recognition_title}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {recognition.recognition_description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-semibold">{formatCurrency(recognition.total_contribution_fcfa)}</p>
                          <p className="text-muted-foreground">Total Contributed</p>
                        </div>
                        <div>
                          <p className="font-semibold">{recognition.projects_supported}</p>
                          <p className="text-muted-foreground">Projects Supported</p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {recognition.diaspora_profiles.country_of_residence} • {recognition.diaspora_profiles.home_region}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Community Impact Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Community Impact This {activeTab === 'monthly' ? 'Month' : activeTab === 'quarterly' ? 'Quarter' : activeTab === 'yearly' ? 'Year' : 'Period'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {leaderboard.reduce((sum, entry) => sum + entry.total_contributions, 0) > 0 
                      ? formatCurrency(leaderboard.reduce((sum, entry) => sum + entry.total_contributions, 0))
                      : '0'
                    }
                  </div>
                  <p className="text-sm text-muted-foreground">Total Raised (FCFA)</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {leaderboard.reduce((sum, entry) => sum + entry.projects_supported, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Projects Funded</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{leaderboard.length}</div>
                  <p className="text-sm text-muted-foreground">Active Contributors</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {new Set(leaderboard.map(entry => entry.home_region)).size}
                  </div>
                  <p className="text-sm text-muted-foreground">Regions Impacted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};