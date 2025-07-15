import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RegionEmbed } from './OfficialEmbedEngine';
import {
  MapPin,
  Users,
  TrendingUp,
  Star,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';

interface RegionalStats {
  totalOfficials: number;
  verifiedOfficials: number;
  averageRating: number;
  averageCivicScore: number;
  totalRatings: number;
  sentimentScore: number;
  activeEvents: number;
  recentActivity: number;
}

interface RegionalCivicDashboardProps {
  regionName?: string;
}

export const RegionalCivicDashboard: React.FC<RegionalCivicDashboardProps> = ({ regionName }) => {
  const { region } = useParams<{ region: string }>();
  const targetRegion = regionName || region || 'Centre';

  // Fetch regional statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['regional_stats', targetRegion],
    queryFn: async () => {
      // Get officials data
      const { data: officials, error: officialsError } = await supabase
        .from('politicians')
        .select(`
          id,
          civic_score,
          verified,
          approval_ratings(rating)
        `)
        .eq('region', targetRegion)
        .eq('is_archived', false);

      if (officialsError) throw officialsError;

      // Get regional sentiment
      const { data: sentiment, error: sentimentError } = await supabase
        .from('camerpulse_intelligence_regional_sentiment')
        .select('overall_sentiment, content_volume')
        .eq('region', targetRegion)
        .order('date_recorded', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sentimentError) throw sentimentError;

      // Get active civic events
      const { data: events, error: eventsError } = await supabase
        .from('civic_service_events')
        .select('id, severity')
        .eq('region', targetRegion)
        .eq('is_active', true);

      if (eventsError) throw eventsError;

      // Calculate statistics
      const totalOfficials = officials?.length || 0;
      const verifiedOfficials = officials?.filter(o => o.verified).length || 0;
      
      // Calculate average rating
      let totalRatings = 0;
      let ratingSum = 0;
      officials?.forEach(official => {
        const ratings = official.approval_ratings || [];
        totalRatings += ratings.length;
        ratingSum += ratings.reduce((sum: number, r: any) => sum + r.rating, 0);
      });
      
      const averageRating = totalRatings > 0 ? ratingSum / totalRatings : 0;
      const averageCivicScore = totalOfficials > 0 
        ? officials.reduce((sum, o) => sum + o.civic_score, 0) / totalOfficials 
        : 0;

      const stats: RegionalStats = {
        totalOfficials,
        verifiedOfficials,
        averageRating,
        averageCivicScore,
        totalRatings,
        sentimentScore: sentiment?.overall_sentiment || 0,
        activeEvents: events?.length || 0,
        recentActivity: sentiment?.content_volume || 0
      };

      return stats;
    }
  });

  // Get region-specific insights
  const { data: insights } = useQuery({
    queryKey: ['regional_insights', targetRegion],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('camerpulse_intelligence_local_sentiment')
        .select('*')
        .eq('region', targetRegion)
        .order('date_recorded', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-600';
    if (score > -0.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.3) return 'Positive';
    if (score > -0.3) return 'Neutral';
    return 'Negative';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            <span>{targetRegion} Region Dashboard</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Comprehensive civic overview and representative performance for {targetRegion} region
          </p>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Officials</p>
                <p className="text-2xl font-bold text-primary">
                  {statsLoading ? '-' : stats?.totalOfficials || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary/60" />
            </div>
            {stats && (
              <div className="mt-2">
                <Progress 
                  value={(stats.verifiedOfficials / stats.totalOfficials) * 100} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.verifiedOfficials} verified officials
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className={`text-2xl font-bold ${stats ? getPerformanceColor(stats.averageRating * 20) : ''}`}>
                  {statsLoading ? '-' : stats?.averageRating?.toFixed(1) || '0.0'}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500/60" />
            </div>
            {stats && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">
                  Based on {stats.totalRatings} citizen ratings
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Civic Performance</p>
                <p className={`text-2xl font-bold ${stats ? getPerformanceColor(stats.averageCivicScore) : ''}`}>
                  {statsLoading ? '-' : `${stats?.averageCivicScore?.toFixed(0) || 0}%`}
                </p>
              </div>
              <Award className="w-8 h-8 text-blue-500/60" />
            </div>
            {stats && (
              <div className="mt-2">
                <Progress value={stats.averageCivicScore} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Regional average
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Public Sentiment</p>
                <p className={`text-2xl font-bold ${stats ? getSentimentColor(stats.sentimentScore) : ''}`}>
                  {statsLoading ? '-' : getSentimentLabel(stats?.sentimentScore || 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500/60" />
            </div>
            {stats && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">
                  {stats.recentActivity} recent mentions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {stats && stats.activeEvents > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-800">
                {stats.activeEvents} active civic service events in this region
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regional Representatives */}
      <RegionEmbed regionName={targetRegion} />

      {/* Recent Regional Activity */}
      {insights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Regional Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.slice(0, 3).map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{insight.city_town}</span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(insight.date_recorded).toLocaleDateString()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sentiment: {getSentimentLabel(insight.overall_sentiment || 0)} • 
                    Volume: {insight.content_volume || 0} mentions
                  </p>
                  {insight.top_concerns && insight.top_concerns.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Top Concerns:</p>
                      <div className="flex flex-wrap gap-1">
                        {insight.top_concerns.slice(0, 3).map((concern: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {concern}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="font-semibold">Strengths</p>
              <p className="text-sm text-muted-foreground">
                {stats?.verifiedOfficials || 0} verified officials with transparent profiles
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="font-semibold">Opportunities</p>
              <p className="text-sm text-muted-foreground">
                {stats && stats.totalOfficials > 0 
                  ? `${Math.round(((stats.totalOfficials - stats.verifiedOfficials) / stats.totalOfficials) * 100)}%` 
                  : '0%'} profiles need verification
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="font-semibold">Engagement</p>
              <p className="text-sm text-muted-foreground">
                {stats?.totalRatings || 0} citizen ratings across all officials
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegionalCivicDashboard;