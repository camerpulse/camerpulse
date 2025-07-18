import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useProfileAnalytics } from '@/hooks/useProfileAnalytics';
import { Eye, Users, TrendingUp, Clock, MapPin, User, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProfileAnalyticsDashboardProps {
  profileId: string;
  isOwner: boolean;
}

export const ProfileAnalyticsDashboard: React.FC<ProfileAnalyticsDashboardProps> = ({
  profileId,
  isOwner
}) => {
  const { analytics, recentViews, loading } = useProfileAnalytics(profileId);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  const StatCard = ({ title, value, icon: Icon, change, description }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    change?: string;
    description?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
        {change && (
          <div className="mt-4">
            <Badge variant={change.startsWith('+') ? 'default' : 'secondary'} className="text-xs">
              {change}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Views"
          value={analytics.total_views.toLocaleString()}
          icon={Eye}
          description="All-time profile views"
        />
        <StatCard
          title="Unique Viewers"
          value={analytics.unique_viewers.toLocaleString()}
          icon={Users}
          description="Distinct visitors"
        />
        <StatCard
          title="Views Today"
          value={analytics.views_today.toLocaleString()}
          icon={Clock}
          description="Views in last 24 hours"
        />
        <StatCard
          title="Engagement Score"
          value={analytics.engagement_score}
          icon={TrendingUp}
          change={analytics.follower_growth > 0 ? `+${analytics.follower_growth}%` : `${analytics.follower_growth}%`}
          description="Based on interactions"
        />
      </div>

      {/* Time-based Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Views Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">This Week</span>
                <span className="font-semibold">{analytics.views_this_week}</span>
              </div>
              <Progress 
                value={(analytics.views_this_week / Math.max(analytics.views_this_month, 1)) * 100} 
                className="h-2"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">This Month</span>
                <span className="font-semibold">{analytics.views_this_month}</span>
              </div>
              <Progress 
                value={(analytics.views_this_month / Math.max(analytics.total_views, 1)) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Popular Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Popular Viewing Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-1">
              {analytics.popular_times.map(({ hour, views }) => {
                const maxViews = Math.max(...analytics.popular_times.map(t => t.views));
                const intensity = maxViews > 0 ? (views / maxViews) * 100 : 0;
                
                return (
                  <div key={hour} className="text-center">
                    <div 
                      className="h-8 bg-primary/20 rounded mb-1 flex items-end justify-center text-xs"
                      style={{ backgroundColor: `hsl(var(--primary) / ${intensity / 100})` }}
                    >
                      {views > 0 && <span className="text-[10px] mb-1">{views}</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Demographics */}
        {analytics.viewer_demographics.regions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Viewer Regions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.viewer_demographics.regions
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map(({ region, count }) => {
                  const percentage = (count / analytics.total_views) * 100;
                  return (
                    <div key={region} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{region}</span>
                        <span className="text-xs text-muted-foreground">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )}

        {/* Profile Type Demographics */}
        {analytics.viewer_demographics.profile_types.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Viewer Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.viewer_demographics.profile_types
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map(({ type, count }) => {
                  const percentage = (count / analytics.total_views) * 100;
                  const typeLabels: { [key: string]: string } = {
                    normal_user: 'Citizens',
                    politician: 'Politicians',
                    artist: 'Artists',
                    company: 'Companies',
                    journalist: 'Journalists'
                  };
                  
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {typeLabels[type] || type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Views (Owner Only) */}
      {isOwner && recentViews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Recent Profile Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentViews.slice(0, 10).map((view) => (
                <div key={view.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm">
                      {view.viewer_id ? (
                        <span className="font-medium">Registered User</span>
                      ) : (
                        <span className="text-muted-foreground">Anonymous Visitor</span>
                      )}
                    </p>
                    {view.viewer_region && (
                      <p className="text-xs text-muted-foreground">
                        From {view.viewer_region}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(view.view_date), { addSuffix: true })}
                    </p>
                    {view.viewer_profile_type && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {view.viewer_profile_type}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};