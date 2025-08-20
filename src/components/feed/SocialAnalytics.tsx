import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Target,
  Zap,
  Award,
  Calendar,
  Clock,
  Globe
} from 'lucide-react';

interface AnalyticsData {
  totalPosts: number;
  totalEngagement: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  topPerformingPost: {
    id: string;
    content: string;
    engagement: number;
  };
  weeklyGrowth: number;
  peakHours: string[];
  topTopics: string[];
  audienceInsights: {
    regions: { name: string; percentage: number }[];
    ageGroups: { range: string; percentage: number }[];
  };
}

export const SocialAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Mock analytics data - in real app, fetch from analytics service
      const mockAnalytics: AnalyticsData = {
        totalPosts: 24,
        totalEngagement: 1247,
        reach: 8934,
        impressions: 15678,
        engagementRate: 7.9,
        topPerformingPost: {
          id: 'post_123',
          content: 'The recent healthcare reforms have sparked important discussions...',
          engagement: 342
        },
        weeklyGrowth: 12.5,
        peakHours: ['9:00 AM', '2:00 PM', '7:00 PM'],
        topTopics: ['Healthcare', 'Education', 'Infrastructure', 'Economy'],
        audienceInsights: {
          regions: [
            { name: 'Centre', percentage: 35 },
            { name: 'Littoral', percentage: 28 },
            { name: 'West', percentage: 22 },
            { name: 'Northwest', percentage: 15 }
          ],
          ageGroups: [
            { range: '18-24', percentage: 32 },
            { range: '25-34', percentage: 45 },
            { range: '35-44', percentage: 18 },
            { range: '45+', percentage: 5 }
          ]
        }
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      default: return 'Last 7 days';
    }
  };

  if (!user) return null;

  if (isLoading || !analytics) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 animate-pulse" />
            Your Impact Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-2 bg-muted rounded w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Your Impact Analytics
          </CardTitle>
          <div className="flex items-center gap-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="h-6 px-2 text-xs"
              >
                {range === '7d' ? '7D' : range === '30d' ? '30D' : '90D'}
              </Button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{getTimeRangeLabel(timeRange)}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-muted-foreground">Engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{analytics.totalEngagement.toLocaleString()}</span>
              <Badge variant="secondary" className="text-xs h-4 px-1">
                +{analytics.weeklyGrowth}%
              </Badge>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-muted-foreground">Reach</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{analytics.reach.toLocaleString()}</span>
              <Badge variant="outline" className="text-xs h-4 px-1">
                {analytics.engagementRate}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Engagement Breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Engagement Breakdown
          </h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500" />
                <span>Likes</span>
              </div>
              <span className="font-medium">680</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-blue-500" />
                <span>Comments</span>
              </div>
              <span className="font-medium">234</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Share2 className="w-3 h-3 text-green-500" />
                <span>Shares</span>
              </div>
              <span className="font-medium">333</span>
            </div>
          </div>
        </div>

        {/* Top Performing Post */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium flex items-center gap-1">
            <Award className="w-3 h-3" />
            Top Performing Post
          </h4>
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-xs line-clamp-2 mb-1">
              {analytics.topPerformingPost.content}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              <span>{analytics.topPerformingPost.engagement} interactions</span>
            </div>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Peak Engagement Hours
          </h4>
          <div className="flex items-center gap-1">
            {analytics.peakHours.map((hour) => (
              <Badge key={hour} variant="outline" className="text-xs h-5 px-2">
                {hour}
              </Badge>
            ))}
          </div>
        </div>

        {/* Top Topics */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium flex items-center gap-1">
            <Target className="w-3 h-3" />
            Top Discussion Topics
          </h4>
          <div className="space-y-1">
            {analytics.topTopics.slice(0, 3).map((topic, index) => (
              <div key={topic} className="flex items-center justify-between">
                <span className="text-xs">{topic}</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={85 - index * 15} 
                    className="w-12 h-1" 
                  />
                  <span className="text-xs text-muted-foreground">
                    {85 - index * 15}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Insights */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium flex items-center gap-1">
            <Globe className="w-3 h-3" />
            Audience by Region
          </h4>
          <div className="space-y-1">
            {analytics.audienceInsights.regions.slice(0, 3).map((region) => (
              <div key={region.name} className="flex items-center justify-between">
                <span className="text-xs">{region.name}</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={region.percentage} 
                    className="w-12 h-1" 
                  />
                  <span className="text-xs text-muted-foreground">
                    {region.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Button variant="outline" size="sm" className="w-full h-8 text-xs">
          <BarChart3 className="w-3 h-3 mr-1" />
          View Full Analytics
        </Button>
      </CardContent>
    </Card>
  );
};