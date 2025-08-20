import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart, 
  Users, 
  TrendingUp, 
  MessageCircle, 
  Heart, 
  Share2,
  Calendar,
  Target,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface PetitionAnalyticsProps {
  petitionId: string;
}

interface AnalyticsData {
  total_views: number;
  unique_visitors: number;
  total_signatures: number;
  total_comments: number;
  total_reactions: number;
  total_shares: number;
  conversion_rate: number;
  engagement_score: number;
  daily_data: Array<{
    date: string;
    views: number;
    signatures: number;
    comments: number;
    reactions: number;
  }>;
  growth_metrics: {
    views_growth: number;
    signatures_growth: number;
    engagement_growth: number;
  };
}

export const PetitionAnalytics: React.FC<PetitionAnalyticsProps> = ({ petitionId }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [petitionId, timeframe]);

  const fetchAnalytics = async () => {
    try {
      // Calculate date range based on timeframe
      const endDate = new Date();
      const startDate = new Date();
      switch (timeframe) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      // Fetch analytics data
      const { data: analyticsData, error } = await supabase
        .from('petition_analytics')
        .select('*')
        .eq('petition_id', petitionId)
        .gte('date_tracked', startDate.toISOString().split('T')[0])
        .lte('date_tracked', endDate.toISOString().split('T')[0])
        .order('date_tracked', { ascending: true });

      if (error) throw error;

      // Aggregate data
      const totalData = analyticsData?.reduce((acc, day) => ({
        total_views: acc.total_views + (day.views_count || 0),
        unique_visitors: acc.unique_visitors + (day.unique_visitors || 0),
        total_signatures: acc.total_signatures + (day.signatures_added || 0),
        total_comments: acc.total_comments + (day.comments_added || 0),
        total_reactions: acc.total_reactions + (day.reactions_added || 0),
        total_shares: acc.total_shares + (day.shares_count || 0),
      }), {
        total_views: 0,
        unique_visitors: 0,
        total_signatures: 0,
        total_comments: 0,
        total_reactions: 0,
        total_shares: 0,
      }) || {
        total_views: 0,
        unique_visitors: 0,
        total_signatures: 0,
        total_comments: 0,
        total_reactions: 0,
        total_shares: 0,
      };

      // Calculate conversion rate and engagement
      const conversion_rate = totalData.total_views > 0 
        ? (totalData.total_signatures / totalData.total_views) * 100 
        : 0;

      const engagement_score = totalData.total_views > 0 
        ? ((totalData.total_comments + totalData.total_reactions + totalData.total_shares) / totalData.total_views) * 100 
        : 0;

      // Calculate growth metrics (compare with previous period)
      const previousPeriodStart = new Date(startDate);
      const periodDuration = endDate.getTime() - startDate.getTime();
      previousPeriodStart.setTime(startDate.getTime() - periodDuration);

      const { data: previousData } = await supabase
        .from('petition_analytics')
        .select('*')
        .eq('petition_id', petitionId)
        .gte('date_tracked', previousPeriodStart.toISOString().split('T')[0])
        .lt('date_tracked', startDate.toISOString().split('T')[0]);

      const previousTotal = previousData?.reduce((acc, day) => ({
        views: acc.views + (day.views_count || 0),
        signatures: acc.signatures + (day.signatures_added || 0),
        engagement: acc.engagement + ((day.comments_added || 0) + (day.reactions_added || 0) + (day.shares_count || 0)),
      }), { views: 0, signatures: 0, engagement: 0 }) || { views: 0, signatures: 0, engagement: 0 };

      const growth_metrics = {
        views_growth: previousTotal.views > 0 
          ? ((totalData.total_views - previousTotal.views) / previousTotal.views) * 100 
          : 0,
        signatures_growth: previousTotal.signatures > 0 
          ? ((totalData.total_signatures - previousTotal.signatures) / previousTotal.signatures) * 100 
          : 0,
        engagement_growth: previousTotal.engagement > 0 
          ? (((totalData.total_comments + totalData.total_reactions + totalData.total_shares) - previousTotal.engagement) / previousTotal.engagement) * 100 
          : 0,
      };

      setAnalytics({
        ...totalData,
        conversion_rate,
        engagement_score,
        daily_data: analyticsData?.map(day => ({
          date: day.date_tracked,
          views: day.views_count || 0,
          signatures: day.signatures_added || 0,
          comments: day.comments_added || 0,
          reactions: day.reactions_added || 0,
        })) || [],
        growth_metrics
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No analytics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const GrowthIndicator = ({ value }: { value: number }) => {
    const isPositive = value > 0;
    const isNeutral = value === 0;
    
    return (
      <div className={`flex items-center gap-1 text-xs ${
        isNeutral ? 'text-muted-foreground' : 
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {!isNeutral && (
          isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />
        )}
        <span>{isNeutral ? '0%' : `${Math.abs(value).toFixed(1)}%`}</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Analytics
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant={timeframe === '7d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeframe('7d')}
            >
              7D
            </Button>
            <Button 
              variant={timeframe === '30d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeframe('30d')}
            >
              30D
            </Button>
            <Button 
              variant={timeframe === '90d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeframe('90d')}
            >
              90D
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                Views
              </div>
              <GrowthIndicator value={analytics.growth_metrics.views_growth} />
            </div>
            <div className="text-2xl font-bold">{analytics.total_views.toLocaleString()}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                Signatures
              </div>
              <GrowthIndicator value={analytics.growth_metrics.signatures_growth} />
            </div>
            <div className="text-2xl font-bold">{analytics.total_signatures.toLocaleString()}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              Conversion
            </div>
            <div className="text-2xl font-bold">{analytics.conversion_rate.toFixed(1)}%</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                Engagement
              </div>
              <GrowthIndicator value={analytics.growth_metrics.engagement_growth} />
            </div>
            <div className="text-2xl font-bold">{analytics.engagement_score.toFixed(1)}%</div>
          </div>
        </div>

        {/* Engagement Breakdown */}
        <Tabs defaultValue="engagement" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="activity">Daily Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">{analytics.total_comments}</div>
                <div className="text-sm text-muted-foreground">Comments</div>
              </div>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <Heart className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-2xl font-bold">{analytics.total_reactions}</div>
                <div className="text-sm text-muted-foreground">Reactions</div>
              </div>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <Share2 className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{analytics.total_shares}</div>
                <div className="text-sm text-muted-foreground">Shares</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-3">
              {analytics.daily_data.slice(-7).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{day.views} views</span>
                    <span>{day.signatures} signatures</span>
                    <span>{day.comments + day.reactions} interactions</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};