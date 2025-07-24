import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProfileAnalytics } from '@/hooks/useProfileAnalytics';
import { 
  Eye, 
  Users, 
  TrendingUp, 
  Clock, 
  MapPin,
  Calendar,
  BarChart3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProfileAnalyticsProps {
  profileId: string;
  isOwnProfile?: boolean;
}

export const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({ 
  profileId, 
  isOwnProfile = false 
}) => {
  const { analytics, loading } = useProfileAnalytics(profileId);

  if (!isOwnProfile || loading) {
    return null;
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{analytics.total_views.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{analytics.unique_viewers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Unique Viewers</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{analytics.engagement_score}%</div>
            <div className="text-sm text-muted-foreground">Engagement Score</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">+{analytics.follower_growth}</div>
            <div className="text-sm text-muted-foreground">New Followers</div>
          </CardContent>
        </Card>
      </div>

      {/* Time Period Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{analytics.views_today}</div>
              <div className="text-sm text-muted-foreground">Views Today</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{analytics.views_this_week}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">{analytics.views_this_month}</div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Times */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Viewing Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {analytics.popular_times.map((time) => (
              <div key={time.hour} className="text-center">
                <div className="text-xs text-muted-foreground">{time.hour}:00</div>
                <div 
                  className="w-full bg-gray-200 rounded-full h-2 mt-1"
                >
                  <div 
                    className="bg-primary h-2 rounded-full"
                    style={{ 
                      width: `${Math.min(100, (time.views / Math.max(...analytics.popular_times.map(t => t.views))) * 100)}%` 
                    }}
                  />
                </div>
                <div className="text-xs font-semibold mt-1">{time.views}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Viewer Demographics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Top Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.viewer_demographics.regions.map((region, index) => (
                <div key={region.region} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm">{region.region}</span>
                  </div>
                  <Badge variant="secondary">{region.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Viewer Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.viewer_demographics.profile_types.map((type, index) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm capitalize">{type.type.replace('_', ' ')}</span>
                  </div>
                  <Badge variant="secondary">{type.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};