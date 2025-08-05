import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsMetricsCard } from './AnalyticsMetricsCard';
import { AnalyticsCharts } from './AnalyticsCharts';
import { AnalyticsFilters } from './AnalyticsFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, MousePointer, MessageCircle, Star, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  totalMessages: number;
  totalRatings: number;
  averageRating: number;
  engagementScore: number;
  rankingPosition?: number;
  sentimentScore?: number;
  uniqueVisitors: number;
}

interface InstitutionAnalyticsDashboardProps {
  institutionId: string;
  institutionType: string;
  institutionName: string;
}

export const InstitutionAnalyticsDashboard: React.FC<InstitutionAnalyticsDashboardProps> = ({
  institutionId,
  institutionType,
  institutionName
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sample chart data - would come from real analytics
  const engagementData = [
    { name: 'Mon', views: 124, clicks: 34, messages: 8 },
    { name: 'Tue', views: 156, clicks: 42, messages: 12 },
    { name: 'Wed', views: 189, clicks: 38, messages: 15 },
    { name: 'Thu', views: 203, clicks: 51, messages: 9 },
    { name: 'Fri', views: 178, clicks: 46, messages: 18 },
    { name: 'Sat', views: 234, clicks: 62, messages: 14 },
    { name: 'Sun', views: 198, clicks: 45, messages: 11 }
  ];

  const viewsData = [
    { name: 'Week 1', value: 1247 },
    { name: 'Week 2', value: 1389 },
    { name: 'Week 3', value: 1567 },
    { name: 'Week 4', value: 1423 }
  ];

  const ratingsDistribution = [
    { name: '5 Stars', value: 45 },
    { name: '4 Stars', value: 32 },
    { name: '3 Stars', value: 18 },
    { name: '2 Stars', value: 3 },
    { name: '1 Star', value: 2 }
  ];

  const sentimentData = [
    { name: 'Jan', sentiment: 4.2 },
    { name: 'Feb', sentiment: 4.1 },
    { name: 'Mar', sentiment: 4.4 },
    { name: 'Apr', sentiment: 4.3 },
    { name: 'May', sentiment: 4.5 },
    { name: 'Jun', sentiment: 4.6 }
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [institutionId, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Calculate days based on time range
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch analytics summary
      const { data: summaryData, error: summaryError } = await supabase
        .from('institution_analytics_summary')
        .select('*')
        .eq('institution_id', institutionId)
        .gte('summary_date', startDate.toISOString().split('T')[0])
        .order('summary_date', { ascending: false });

      if (summaryError) throw summaryError;

      // Calculate totals
      const totals = summaryData?.reduce((acc, day) => ({
        totalViews: acc.totalViews + (day.total_views || 0),
        totalClicks: acc.totalClicks + (day.total_clicks || 0),
        totalMessages: acc.totalMessages + (day.total_messages || 0),
        totalRatings: acc.totalRatings + (day.total_ratings || 0),
        uniqueVisitors: acc.uniqueVisitors + (day.unique_visitors || 0),
      }), {
        totalViews: 0,
        totalClicks: 0,
        totalMessages: 0,
        totalRatings: 0,
        uniqueVisitors: 0,
      }) || {
        totalViews: 0,
        totalClicks: 0,
        totalMessages: 0,
        totalRatings: 0,
        uniqueVisitors: 0,
      };

      // Get latest summary for other metrics
      const latestSummary = summaryData?.[0];

      // Calculate engagement score
      const { data: engagementData, error: engagementError } = await supabase
        .rpc('calculate_engagement_score', {
          p_institution_id: institutionId,
          p_period_days: days
        });

      if (engagementError) {
        console.error('Error calculating engagement:', engagementError);
      }

      setAnalyticsData({
        ...totals,
        averageRating: latestSummary?.average_rating || 0,
        engagementScore: engagementData || 0,
        rankingPosition: latestSummary?.ranking_position,
        sentimentScore: latestSummary?.sentiment_score,
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      // In a real implementation, this would generate and download a PDF report
      toast.success('Report download started');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const handleEmailDigest = async () => {
    try {
      // In a real implementation, this would send an email digest
      toast.success('Email digest scheduled');
    } catch (error) {
      toast.error('Failed to schedule email digest');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Performance insights for {institutionName}
        </p>
      </div>

      {/* Filters */}
      <AnalyticsFilters
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onDownloadReport={handleDownloadReport}
        onEmailDigest={handleEmailDigest}
        comparisonMode={comparisonMode}
        onComparisonToggle={() => setComparisonMode(!comparisonMode)}
        institutionType={institutionType}
      />

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsMetricsCard
          title="Total Views"
          value={analyticsData?.totalViews.toLocaleString() || '0'}
          change={12.5}
          changeType="increase"
          icon={<Eye className="h-4 w-4" />}
          subtitle="Profile page visits"
        />
        <AnalyticsMetricsCard
          title="Click-Through Rate"
          value={`${((analyticsData?.totalClicks / Math.max(analyticsData?.totalViews || 1, 1)) * 100).toFixed(1)}%`}
          change={3.2}
          changeType="increase"
          icon={<MousePointer className="h-4 w-4" />}
          subtitle="From search to profile"
        />
        <AnalyticsMetricsCard
          title="Messages Received"
          value={analyticsData?.totalMessages.toLocaleString() || '0'}
          change={-2.1}
          changeType="decrease"
          icon={<MessageCircle className="h-4 w-4" />}
          subtitle="Direct inquiries"
        />
        <AnalyticsMetricsCard
          title="Average Rating"
          value={`${analyticsData?.averageRating?.toFixed(1) || '0.0'}/5`}
          change={0.3}
          changeType="increase"
          icon={<Star className="h-4 w-4" />}
          subtitle="From user reviews"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <AnalyticsMetricsCard
          title="Engagement Score"
          value={analyticsData?.engagementScore?.toFixed(1) || '0.0'}
          icon={<TrendingUp className="h-4 w-4" />}
          subtitle="Overall activity level"
        />
        <AnalyticsMetricsCard
          title="Unique Visitors"
          value={analyticsData?.uniqueVisitors.toLocaleString() || '0'}
          icon={<Users className="h-4 w-4" />}
          subtitle="Distinct users"
        />
        {analyticsData?.rankingPosition && (
          <AnalyticsMetricsCard
            title="Ranking Position"
            value={`#${analyticsData.rankingPosition}`}
            subtitle={`Among ${institutionType}s`}
          />
        )}
      </div>

      {/* Charts */}
      <AnalyticsCharts
        engagementData={engagementData}
        viewsData={viewsData}
        ratingsDistribution={ratingsDistribution}
        sentimentData={sentimentData}
      />

      {/* Comparison Mode */}
      {comparisonMode && (
        <Card className="analytics-card">
          <CardHeader>
            <CardTitle>Comparison with Similar Institutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Comparison data will be available here.</p>
              <p className="text-sm">Compare your performance with similar {institutionType}s in your region.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};