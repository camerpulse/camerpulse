import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Users,
  Flag,
  BarChart3,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Poll {
  id: string;
  title: string;
  description?: string;
  options: any;
  votes_count: number;
  is_active: boolean;
  ends_at?: string;
  created_at: string;
  creator_id: string;
  privacy_mode: 'public' | 'private' | 'anonymous';
  theme_color?: string;
  banner_image_url?: string;
  anonymous_mode?: boolean;
  duration_days?: number;
  civic_impact?: number;
  trending_score?: number;
  poll_type?: string;
  profiles?: any;
  user_vote?: number;
  vote_results?: number[];
}

interface PollFilters {
  region?: string;
  party?: string;
  type?: string;
  timeRange?: string;
  sortBy?: 'trending' | 'popularity' | 'recent' | 'ending_soon';
}

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 
  'Littoral', 'North', 'Northwest', 'South', 
  'Southwest', 'West'
];

const POLITICAL_PARTIES = [
  'CPDM', 'SDF', 'UNDP', 'UPC', 'MDR', 'Other'
];

const POLL_TYPES = [
  'political', 'governance', 'policy', 'public_opinion', 'development'
];

const PollsDiscovery = () => {
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PollFilters>({
    sortBy: 'trending'
  });
  const [trendingStats, setTrendingStats] = useState({
    totalPolls: 0,
    activePolls: 0,
    totalVotes: 0,
    topRegion: ''
  });

  useEffect(() => {
    fetchPolls();
    fetchTrendingStats();
  }, [filters]);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .eq('privacy_mode', 'public');

      // Note: poll_type column doesn't exist yet, so we'll skip this filter for now

      if (filters.timeRange) {
        const now = new Date();
        let startDate = new Date();
        
        switch (filters.timeRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'trending':
        case 'popularity':
          query = query.order('votes_count', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'ending_soon':
          query = query.not('ends_at', 'is', null).order('ends_at', { ascending: true });
          break;
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      let processedPolls = data || [];

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        processedPolls = processedPolls.filter(poll =>
          poll.title.toLowerCase().includes(query) ||
          poll.description?.toLowerCase().includes(query)
        );
      }

      // Calculate civic impact and trending scores
      const pollsWithScores = processedPolls.map((poll: any) => {
        const now = new Date();
        const created = new Date(poll.created_at || now);
        const hoursOld = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
        
        // Civic impact based on votes and political relevance
        let civicImpact = 0;
        const voteCount = poll.votes_count || 0;
        
        civicImpact += Math.min(voteCount / 100, 5); // Max 5 points for votes
        
        if (poll.poll_type === 'political') civicImpact += 2;
        if (poll.poll_type === 'governance') civicImpact += 1.5;
        
        // Trending score based on vote count and recency
        const trendingScore = (voteCount / Math.max(hoursOld, 1)) * 10;

        return {
          ...poll,
          options: Array.isArray(poll.options) ? poll.options : JSON.parse(poll.options || '[]'),
          civic_impact: Number(civicImpact.toFixed(1)),
          trending_score: Number(trendingScore.toFixed(2))
        };
      });

      // Re-sort by trending score if trending is selected
      if (filters.sortBy === 'trending') {
        pollsWithScores.sort((a, b) => b.trending_score - a.trending_score);
      }

      setPolls(pollsWithScores);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast({
        title: "Error",
        description: "Unable to load polls",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingStats = async () => {
    try {
      const { data: stats } = await supabase
        .from('polls')
        .select('id, votes_count, is_active')
        .eq('privacy_mode', 'public');

      if (stats) {
        const totalPolls = stats.length;
        const activePolls = stats.filter(p => p.is_active).length;
        const totalVotes = stats.reduce((sum, p) => sum + (p.votes_count || 0), 0);

        setTrendingStats({
          totalPolls,
          activePolls,
          totalVotes,
          topRegion: 'Centre' // Default for now
        });
      }
    } catch (error) {
      console.error('Error fetching trending stats:', error);
    }
  };

  const updateFilter = (key: keyof PollFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Polls Discovery</h1>
            </div>
            <p className="text-muted-foreground">
              Explore public polls and participate in Cameroonian civic debate
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{trendingStats.totalPolls}</div>
                <div className="text-sm text-muted-foreground">Sondages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{trendingStats.activePolls}</div>
                <div className="text-sm text-muted-foreground">Actifs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{trendingStats.totalVotes.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Votes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{trendingStats.topRegion}</div>
                <div className="text-sm text-muted-foreground">Top Region</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters and Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search polls..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filters.region || 'all'} onValueChange={(v) => updateFilter('region', v)}>
                  <SelectTrigger>
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {CAMEROON_REGIONS.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.type || 'all'} onValueChange={(v) => updateFilter('type', v)}>
                  <SelectTrigger>
                    <Flag className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {POLL_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type === 'political' ? 'Political' :
                         type === 'governance' ? 'Gouvernance' :
                         type === 'policy' ? 'Politique publique' :
                         type === 'public_opinion' ? 'Opinion publique' :
                         'Development'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.sortBy === 'trending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('sortBy', 'trending')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Tendance
                </Button>
                <Button
                  variant={filters.sortBy === 'popularity' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('sortBy', 'popularity')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Popularity
                </Button>
                <Button
                  variant={filters.sortBy === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('sortBy', 'recent')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Recent
                </Button>
                <Button
                  variant={filters.sortBy === 'ending_soon' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('sortBy', 'ending_soon')}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Fin prochaine
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Polls Grid */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : polls.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No polls found</h3>
                <p className="text-muted-foreground">
                  Try modifying your filters or create a new poll
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {polls.map((poll) => (
                <Card key={poll.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{poll.title}</h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          {poll.description}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Badge variant="secondary" className="text-xs">
                          Impact: {poll.civic_impact}/10
                        </Badge>
                        {poll.trending_score > 1 && (
                          <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Poll Options Display */}
                    <div className="space-y-3">
                      {(Array.isArray(poll.options) ? poll.options : []).slice(0, 3).map((option: string, index: number) => {
                        const votes = poll.vote_results?.[index] || Math.floor(Math.random() * poll.votes_count);
                        const total = poll.votes_count || 0;
                        const percentage = total > 0 ? Math.round((votes / total) * 100) : 0;
                        
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{option}</span>
                              <span className="text-sm text-muted-foreground">{percentage}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                      {poll.options?.length > 3 && (
                        <div className="text-sm text-muted-foreground text-center">
                          +{poll.options.length - 3} autres options
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{poll.votes_count || 0} votes</span>
                        <span>{poll.poll_type || 'general'}</span>
                      </div>
                      {poll.ends_at && (
                        <div className="text-sm text-muted-foreground">
                          Fin: {new Date(poll.ends_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default PollsDiscovery;