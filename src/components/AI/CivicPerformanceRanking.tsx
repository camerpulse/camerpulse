import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RankingEmbed } from './OfficialEmbedEngine';
import {
  Trophy,
  Star,
  TrendingUp,
  Award,
  Medal,
  Target,
  Users,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface RankingFilters {
  timeframe: 'week' | 'month' | 'quarter' | 'year' | 'all';
  region: string;
  role: string;
  metric: 'overall' | 'rating' | 'civic_score' | 'engagement';
}

interface RankingStats {
  totalOfficials: number;
  averageRating: number;
  highPerformers: number;
  newRatings: number;
  topRegion: string;
  improvementRate: number;
}

export const CivicPerformanceRanking: React.FC = () => {
  const [filters, setFilters] = useState<RankingFilters>({
    timeframe: 'month',
    region: 'all',
    role: 'all',
    metric: 'overall'
  });

  const [activeTab, setActiveTab] = useState('leaderboard');

  // Fetch ranking statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['ranking_stats', filters],
    queryFn: async () => {
      const { data: officials, error } = await supabase
        .from('politicians')
        .select(`
          id,
          region,
          level_of_office,
          civic_score,
          approval_ratings!inner(rating, created_at)
        `)
        .eq('is_archived', false);

      if (error) throw error;

      // Calculate statistics
      const totalOfficials = officials?.length || 0;
      const allRatings = officials?.flatMap(o => o.approval_ratings) || [];
      const averageRating = allRatings.length > 0 
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length 
        : 0;

      const highPerformers = officials?.filter(o => {
        const officialRatings = o.approval_ratings || [];
        const avgRating = officialRatings.length > 0
          ? officialRatings.reduce((sum, r) => sum + r.rating, 0) / officialRatings.length
          : 0;
        return avgRating >= 4 && o.civic_score >= 75;
      }).length || 0;

      // Calculate regional performance
      const regionMap = new Map();
      officials?.forEach(official => {
        if (!regionMap.has(official.region)) {
          regionMap.set(official.region, []);
        }
        regionMap.get(official.region).push(official);
      });

      let topRegion = 'N/A';
      let bestRegionScore = 0;
      
      regionMap.forEach((regionOfficials, region) => {
        const avgScore = regionOfficials.reduce((sum: number, o: any) => sum + o.civic_score, 0) / regionOfficials.length;
        if (avgScore > bestRegionScore) {
          bestRegionScore = avgScore;
          topRegion = region;
        }
      });

      // Calculate recent activity
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      const newRatings = allRatings.filter(r => new Date(r.created_at) > cutoffDate).length;

      const stats: RankingStats = {
        totalOfficials,
        averageRating,
        highPerformers,
        newRatings,
        topRegion,
        improvementRate: Math.round((newRatings / totalOfficials) * 100)
      };

      return stats;
    }
  });

  // Fetch top performers by category
  const { data: categoryWinners } = useQuery({
    queryKey: ['category_winners', filters],
    queryFn: async () => {
      const categories = [
        { name: 'Highest Rated', metric: 'rating', icon: Star },
        { name: 'Best Civic Score', metric: 'civic_score', icon: Award },
        { name: 'Most Engaged', metric: 'engagement', icon: Users },
        { name: 'Rising Star', metric: 'improvement', icon: TrendingUp }
      ];

      const winners = [];

      for (const category of categories) {
        let query = supabase
          .from('politicians')
          .select(`
            id,
            name,
            profile_image_url,
            region,
            role_title,
            civic_score,
            verified,
            approval_ratings(rating)
          `)
          .eq('is_archived', false);

        if (filters.region !== 'all') {
          query = query.eq('region', filters.region);
        }

        if (filters.role !== 'all') {
          query = query.eq('level_of_office', filters.role);
        }

        const { data, error } = await query.limit(1);
        
        if (!error && data && data.length > 0) {
          const official = data[0];
          const ratings = official.approval_ratings || [];
          const averageRating = ratings.length > 0 
            ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length 
            : 0;

          winners.push({
            category: category.name,
            icon: category.icon,
            official: {
              ...official,
              average_rating: averageRating,
              total_ratings: ratings.length,
              approval_ratings: undefined
            }
          });
        }
      }

      return winners;
    }
  });

  const handleExportRankings = () => {
    if (!categoryWinners) return;
    
    // Export rankings as CSV
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Rank,Name,Category,Rating,Civic Score\n" +
      categoryWinners.map((winner, index) => 
        `${index + 1},${winner.official.name},${winner.category},${winner.official.average_rating?.toFixed(1) || '0.0'},${winner.official.civic_score}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "civic_performance_rankings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const refreshData = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span>Civic Performance Rankings</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportRankings}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
          <p className="text-muted-foreground">
            Real-time performance tracking and citizen-driven rankings of all public officials
          </p>
        </CardHeader>
      </Card>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Officials</p>
                <p className="text-2xl font-bold text-primary">
                  {statsLoading ? '-' : stats?.totalOfficials?.toLocaleString() || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {statsLoading ? '-' : stats?.averageRating?.toFixed(1) || '0.0'}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.newRatings || 0} new ratings this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Performers</p>
                <p className="text-2xl font-bold text-green-600">
                  {statsLoading ? '-' : stats?.highPerformers || 0}
                </p>
              </div>
              <Award className="w-8 h-8 text-green-500/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              4+ stars & 75%+ civic score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Region</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statsLoading ? '-' : stats?.topRegion || 'N/A'}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-blue-500/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Best performing region
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Ranking Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select 
              value={filters.timeframe} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, timeframe: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="quarter">Past Quarter</SelectItem>
                <SelectItem value="year">Past Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.region} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="Centre">Centre</SelectItem>
                <SelectItem value="Littoral">Littoral</SelectItem>
                <SelectItem value="Northwest">North West</SelectItem>
                <SelectItem value="Southwest">South West</SelectItem>
                <SelectItem value="North">North</SelectItem>
                <SelectItem value="Far North">Far North</SelectItem>
                <SelectItem value="Adamawa">Adamawa</SelectItem>
                <SelectItem value="East">East</SelectItem>
                <SelectItem value="South">South</SelectItem>
                <SelectItem value="West">West</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.role} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="National">Ministers</SelectItem>
                <SelectItem value="Regional">MPs</SelectItem>
                <SelectItem value="Local">Senators</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.metric} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, metric: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">Overall Performance</SelectItem>
                <SelectItem value="rating">Citizen Rating</SelectItem>
                <SelectItem value="civic_score">Civic Score</SelectItem>
                <SelectItem value="engagement">Engagement Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="categories">Category Winners</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-4">
          <RankingEmbed maxItems={20} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryWinners?.map((winner, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <winner.icon className="w-5 h-5 text-primary" />
                    <span>{winner.category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Medal className="w-6 h-6 text-yellow-500" />
                      <Badge variant="secondary">#1</Badge>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{winner.official.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {winner.official.role_title} • {winner.official.region}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= Math.round(winner.official.average_rating || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs">
                          {winner.official.average_rating?.toFixed(1) || '0.0'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {winner.official.civic_score}% civic
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Trend Analysis Coming Soon</h3>
                <p className="text-muted-foreground">
                  Historical performance tracking and trend visualization will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CivicPerformanceRanking;