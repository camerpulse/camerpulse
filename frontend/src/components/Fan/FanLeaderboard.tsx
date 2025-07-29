import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Crown, Star, TrendingUp, Users, Calendar } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  fan_id: string;
  display_name: string;
  avatar_url: string;
  current_rank: number;
  total_points: number;
  monthly_points: number;
  weekly_points: number;
  last_activity_at: string;
  badges: FanBadge[];
}

interface FanBadge {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  badge_icon_url: string;
  earned_at: string;
  is_active: boolean;
}

interface LeaderboardStats {
  global_rank: number;
  total_fans: number;
  points_this_week: number;
  points_this_month: number;
  rank_change: number;
}

export const FanLeaderboard: React.FC = () => {
  const { user } = useAuth();
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<LeaderboardStats | null>(null);
  const [fanProfile, setFanProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'global' | 'weekly' | 'monthly'>('global');

  useEffect(() => {
    if (user) {
      fetchFanProfile();
      fetchLeaderboards();
      fetchUserStats();
    }
  }, [user]);

  const fetchFanProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('fan_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching fan profile:', error);
        return;
      }

      if (data) {
        setFanProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchLeaderboards = async () => {
    try {
      // Fetch leaderboards with fan profiles and badges
      const { data: leaderboardData, error } = await supabase
        .from('fan_leaderboards')
        .select(`
          *,
          fan_profiles!inner (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('leaderboard_type', 'global')
        .order('total_points', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch badges for top fans
      const fanIds = leaderboardData?.map(entry => entry.fan_id) || [];
      const { data: badgesData } = await supabase
        .from('fan_badges')
        .select('*')
        .in('fan_id', fanIds)
        .eq('is_active', true);

      // Combine data
      const combinedData = leaderboardData?.map((entry, index) => ({
        id: entry.id,
        fan_id: entry.fan_id,
        display_name: entry.fan_profiles.display_name,
        avatar_url: entry.fan_profiles.avatar_url,
        current_rank: index + 1,
        total_points: entry.total_points,
        monthly_points: entry.monthly_points,
        weekly_points: entry.weekly_points,
        last_activity_at: entry.last_activity_at,
        badges: badgesData?.filter(badge => badge.fan_id === entry.fan_id) || []
      })) || [];

      setGlobalLeaderboard(combinedData);

      // Create weekly and monthly leaderboards by sorting
      const weeklyData = [...combinedData].sort((a, b) => b.weekly_points - a.weekly_points);
      const monthlyData = [...combinedData].sort((a, b) => b.monthly_points - a.monthly_points);

      setWeeklyLeaderboard(weeklyData.map((entry, index) => ({ ...entry, current_rank: index + 1 })));
      setMonthlyLeaderboard(monthlyData.map((entry, index) => ({ ...entry, current_rank: index + 1 })));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!fanProfile?.id) return;

    try {
      // Get user's position in global leaderboard
      const { data: userRankData } = await supabase
        .from('fan_leaderboards')
        .select('current_rank, total_points, monthly_points, weekly_points')
        .eq('fan_id', fanProfile.id)
        .eq('leaderboard_type', 'global')
        .single();

      // Get total number of fans
      const { count: totalFans } = await supabase
        .from('fan_profiles')
        .select('*', { count: 'exact', head: true });

      if (userRankData) {
        setUserStats({
          global_rank: userRankData.current_rank || 0,
          total_fans: totalFans || 0,
          points_this_week: userRankData.weekly_points || 0,
          points_this_month: userRankData.monthly_points || 0,
          rank_change: 0 // Would need historical data to calculate
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'fan_of_month':
        return <Star className="h-4 w-4" />;
      case 'top_supporter':
        return <Trophy className="h-4 w-4" />;
      case 'voting_champion':
        return <Award className="h-4 w-4" />;
      case 'event_attendee':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Medal className="h-4 w-4" />;
    }
  };

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case 'fan_of_month':
        return 'bg-yellow-500';
      case 'top_supporter':
        return 'bg-blue-500';
      case 'voting_champion':
        return 'bg-purple-500';
      case 'event_attendee':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCurrentLeaderboard = () => {
    switch (selectedPeriod) {
      case 'weekly':
        return weeklyLeaderboard;
      case 'monthly':
        return monthlyLeaderboard;
      default:
        return globalLeaderboard;
    }
  };

  const getPointsForPeriod = (entry: LeaderboardEntry) => {
    switch (selectedPeriod) {
      case 'weekly':
        return entry.weekly_points;
      case 'monthly':
        return entry.monthly_points;
      default:
        return entry.total_points;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              Fan Leaderboard
            </h1>
            <p className="text-muted-foreground">See where you rank among CamerPulse fans</p>
          </div>
        </div>

        {/* User Stats */}
        {userStats && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">#{userStats.global_rank}</div>
                  <div className="text-sm text-muted-foreground">Global Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{userStats.total_fans.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Fans</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{userStats.points_this_week}</div>
                  <div className="text-sm text-muted-foreground">Points This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{userStats.points_this_month}</div>
                  <div className="text-sm text-muted-foreground">Points This Month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Fans
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={selectedPeriod === 'global' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('global')}
                >
                  All Time
                </Button>
                <Button
                  variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('monthly')}
                >
                  This Month
                </Button>
                <Button
                  variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('weekly')}
                >
                  This Week
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getCurrentLeaderboard().slice(0, 20).map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                    entry.fan_id === fanProfile?.id
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center min-w-[60px]">
                    {getRankIcon(entry.current_rank)}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={entry.avatar_url} alt={entry.display_name} />
                    <AvatarFallback>
                      {entry.display_name?.split(' ').map(n => n[0]).join('') || 'F'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Fan Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{entry.display_name}</h4>
                      {entry.fan_id === fanProfile?.id && (
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      )}
                    </div>
                    
                    {/* Badges */}
                    {entry.badges.length > 0 && (
                      <div className="flex gap-1 mb-2">
                        {entry.badges.slice(0, 3).map((badge) => (
                          <div
                            key={badge.id}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white ${getBadgeColor(badge.badge_type)}`}
                            title={badge.badge_description}
                          >
                            {getBadgeIcon(badge.badge_type)}
                            <span className="truncate max-w-[80px]">{badge.badge_name}</span>
                          </div>
                        ))}
                        {entry.badges.length > 3 && (
                          <div className="flex items-center px-2 py-1 rounded-full text-xs bg-gray-500 text-white">
                            +{entry.badges.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground">
                      Last active: {new Date(entry.last_activity_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {getPointsForPeriod(entry).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedPeriod === 'global' ? 'total' : selectedPeriod} points
                    </div>
                  </div>

                  {/* Trend indicator for top 3 */}
                  {entry.current_rank <= 3 && (
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
              ))}

              {getCurrentLeaderboard().length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Leaderboard Data</h3>
                  <p className="text-muted-foreground">Start engaging to see yourself on the leaderboard!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Badge Showcase */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Fan Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  type: 'fan_of_month',
                  name: 'Fan of the Month',
                  description: 'Top fan for the current month',
                  rarity: 'Legendary'
                },
                {
                  type: 'top_supporter',
                  name: 'Top Supporter',
                  description: 'High financial contribution to artists',
                  rarity: 'Epic'
                },
                {
                  type: 'voting_champion',
                  name: 'Voting Champion',
                  description: 'Participated in 10+ voting events',
                  rarity: 'Rare'
                },
                {
                  type: 'event_attendee',
                  name: 'Event Enthusiast',
                  description: 'Attended 5+ events this year',
                  rarity: 'Common'
                }
              ].map((badgeInfo) => (
                <div key={badgeInfo.type} className="p-4 rounded-lg border bg-muted/30 text-center">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white ${getBadgeColor(badgeInfo.type)}`}>
                    {getBadgeIcon(badgeInfo.type)}
                  </div>
                  <h4 className="font-medium mb-1">{badgeInfo.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{badgeInfo.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {badgeInfo.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};