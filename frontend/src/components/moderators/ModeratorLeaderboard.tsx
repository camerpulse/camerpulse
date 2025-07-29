import React, { useState, useEffect } from 'react';
import { 
  Trophy, Crown, Star, Award, TrendingUp, MapPin, 
  Calendar, Users, CheckCircle, Zap, Medal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface ModeratorStats {
  id: string;
  user_id: string;
  moderator_role: string;
  coverage_regions: string[];
  total_edits: number;
  total_approvals: number;
  total_rejections: number;
  badges_count: number;
  last_active_at: string | null;
  created_at: string;
  profile_data?: {
    full_name?: string;
    avatar_url?: string;
  };
}

const roleDisplayNames = {
  village_moderator: 'Village Moderator',
  subdivision_moderator: 'Subdivision Moderator',
  regional_moderator: 'Regional Moderator',
  national_civic_lead: 'National Civic Lead'
};

const roleColors = {
  village_moderator: 'bg-green-100 text-green-800',
  subdivision_moderator: 'bg-blue-100 text-blue-800',
  regional_moderator: 'bg-yellow-100 text-yellow-800',
  national_civic_lead: 'bg-red-100 text-red-800'
};

export const ModeratorLeaderboard: React.FC = () => {
  const [moderators, setModerators] = useState<ModeratorStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    fetchLeaderboardData();
  }, [selectedPeriod]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Get moderators with their stats
      const { data: moderatorsData, error } = await supabase
        .from('civic_moderators')
        .select(`
          id,
          user_id,
          moderator_role,
          coverage_regions,
          total_edits,
          total_approvals,
          total_rejections,
          last_active_at,
          created_at
        `)
        .eq('status', 'approved')
        .order('total_edits', { ascending: false });

      if (error) throw error;

      // Get badge counts for each moderator
      const moderatorIds = moderatorsData.map(m => m.id);
      const { data: badgesData } = await supabase
        .from('moderator_badges')
        .select('moderator_id')
        .in('moderator_id', moderatorIds);

      // Count badges per moderator
      const badgeCounts = badgesData?.reduce((acc, badge) => {
        acc[badge.moderator_id] = (acc[badge.moderator_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Combine data
      const enrichedModerators = moderatorsData.map(mod => ({
        ...mod,
        badges_count: badgeCounts[mod.id] || 0
      }));

      setModerators(enrichedModerators);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopModerators = (criterion: 'edits' | 'approvals' | 'badges') => {
    const sortedMods = [...moderators].sort((a, b) => {
      switch (criterion) {
        case 'edits':
          return b.total_edits - a.total_edits;
        case 'approvals':
          return b.total_approvals - a.total_approvals;
        case 'badges':
          return b.badges_count - a.badges_count;
        default:
          return 0;
      }
    });
    return sortedMods.slice(0, 10);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getActivityLevel = (lastActive: string | null) => {
    if (!lastActive) return { level: 'Inactive', color: 'bg-gray-100 text-gray-800' };
    
    const daysSince = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince <= 1) return { level: 'Very Active', color: 'bg-green-100 text-green-800' };
    if (daysSince <= 7) return { level: 'Active', color: 'bg-blue-100 text-blue-800' };
    if (daysSince <= 30) return { level: 'Moderate', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'Low Activity', color: 'bg-orange-100 text-orange-800' };
  };

  const ModeratorCard: React.FC<{ moderator: ModeratorStats; rank: number; showStat: string }> = ({ 
    moderator, rank, showStat 
  }) => {
    const activity = getActivityLevel(moderator.last_active_at);
    const approvalRate = moderator.total_edits > 0 
      ? Math.round((moderator.total_approvals / moderator.total_edits) * 100)
      : 0;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8">
              {getRankIcon(rank)}
            </div>
            
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-civic/10 text-civic font-semibold">
                {moderator.profile_data?.full_name?.charAt(0) || 'M'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold truncate">
                  {moderator.profile_data?.full_name || 'Moderator'}
                </h3>
                <Badge className={`text-xs px-2 ${activity.color}`}>
                  {activity.level}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${roleColors[moderator.moderator_role as keyof typeof roleColors]}`}
                >
                  {roleDisplayNames[moderator.moderator_role as keyof typeof roleDisplayNames]}
                </Badge>
                
                {moderator.coverage_regions.length > 0 && (
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">
                      {moderator.coverage_regions.slice(0, 2).join(', ')}
                      {moderator.coverage_regions.length > 2 && ` +${moderator.coverage_regions.length - 2}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xl font-bold text-civic">
                {showStat === 'edits' && moderator.total_edits}
                {showStat === 'approvals' && moderator.total_approvals}
                {showStat === 'badges' && moderator.badges_count}
              </div>
              <div className="text-xs text-muted-foreground">
                {showStat === 'edits' && 'Total Edits'}
                {showStat === 'approvals' && 'Approvals'}
                {showStat === 'badges' && 'Badges'}
              </div>
              {showStat === 'approvals' && (
                <div className="text-xs text-muted-foreground mt-1">
                  {approvalRate}% rate
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const topEditors = getTopModerators('edits');
  const topApprovers = getTopModerators('approvals');
  const topBadgeEarners = getTopModerators('badges');

  const totalModerators = moderators.length;
  const totalEdits = moderators.reduce((sum, mod) => sum + mod.total_edits, 0);
  const averageApprovalRate = moderators.length > 0 
    ? Math.round(moderators.reduce((sum, mod) => {
        const rate = mod.total_edits > 0 ? (mod.total_approvals / mod.total_edits) : 0;
        return sum + rate;
      }, 0) / moderators.length * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold flex items-center justify-center">
            <Trophy className="h-8 w-8 mr-3 text-yellow-500" />
            Civic Moderator Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Recognizing our most dedicated civic moderators across Cameroon
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-civic/10 rounded-lg mr-4">
                <Users className="h-6 w-6 text-civic" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalModerators}</p>
                <p className="text-sm text-muted-foreground">Active Moderators</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-success/10 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEdits.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Contributions</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-warning/10 rounded-lg mr-4">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageApprovalRate}%</p>
                <p className="text-sm text-muted-foreground">Avg Approval Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="edits" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="edits" className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Most Active
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Top Approvers
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Badge Leaders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Most Active Moderators
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Moderators with the highest number of total edits and contributions
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {topEditors.map((moderator, index) => (
                  <ModeratorCard
                    key={moderator.id}
                    moderator={moderator}
                    rank={index + 1}
                    showStat="edits"
                  />
                ))}
                {topEditors.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No moderators to display yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Top Approvers
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Moderators who have approved the most submissions
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {topApprovers.map((moderator, index) => (
                  <ModeratorCard
                    key={moderator.id}
                    moderator={moderator}
                    rank={index + 1}
                    showStat="approvals"
                  />
                ))}
                {topApprovers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No moderators to display yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Badge Champions
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Moderators who have earned the most badges and achievements
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {topBadgeEarners.map((moderator, index) => (
                  <ModeratorCard
                    key={moderator.id}
                    moderator={moderator}
                    rank={index + 1}
                    showStat="badges"
                  />
                ))}
                {topBadgeEarners.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No moderators to display yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Monthly Highlights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              This Month's Civic Heroes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topEditors.slice(0, 3).map((moderator, index) => (
                <div key={moderator.id} className="text-center p-4 border rounded-lg">
                  <div className="mb-2">
                    {getRankIcon(index + 1)}
                  </div>
                  <Avatar className="h-16 w-16 mx-auto mb-2">
                    <AvatarFallback className="bg-civic/10 text-civic font-semibold text-lg">
                      {moderator.profile_data?.full_name?.charAt(0) || 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold">
                    {moderator.profile_data?.full_name || 'Moderator'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {moderator.total_edits} contributions
                  </p>
                  <Badge className={`mt-2 ${roleColors[moderator.moderator_role as keyof typeof roleColors]}`}>
                    {roleDisplayNames[moderator.moderator_role as keyof typeof roleDisplayNames]}
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