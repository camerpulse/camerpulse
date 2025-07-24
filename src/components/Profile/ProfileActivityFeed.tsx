import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Award, 
  UserPlus, 
  Star,
  TrendingUp,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  activity_type: string;
  activity_title: string;
  activity_description?: string;
  activity_data: any;
  is_public: boolean;
  created_at: string;
}

interface ProfileActivityFeedProps {
  userId: string;
  isOwnProfile?: boolean;
}

export const ProfileActivityFeed: React.FC<ProfileActivityFeedProps> = ({ 
  userId, 
  isOwnProfile = false 
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      // Get user's profile id first
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('profile_activities')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post_liked': return <Heart className="w-4 h-4 text-red-500" />;
      case 'post_commented': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'post_shared': return <Share2 className="w-4 h-4 text-green-500" />;
      case 'followed_user': return <UserPlus className="w-4 h-4 text-purple-500" />;
      case 'achievement_earned': return <Award className="w-4 h-4 text-yellow-500" />;
      case 'rating_given': return <Star className="w-4 h-4 text-amber-500" />;
      case 'profile_updated': return <TrendingUp className="w-4 h-4 text-indigo-500" />;
      default: return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'post_liked': return 'border-red-200 bg-red-50';
      case 'post_commented': return 'border-blue-200 bg-blue-50';
      case 'post_shared': return 'border-green-200 bg-green-50';
      case 'followed_user': return 'border-purple-200 bg-purple-50';
      case 'achievement_earned': return 'border-yellow-200 bg-yellow-50';
      case 'rating_given': return 'border-amber-200 bg-amber-50';
      case 'profile_updated': return 'border-indigo-200 bg-indigo-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const renderActivityContent = (activity: ActivityItem) => {
    const data = activity.activity_data || {};
    
    switch (activity.activity_type) {
      case 'post_liked':
        return (
          <div className="space-y-2">
            <p className="text-sm">{activity.activity_description}</p>
            {data.post_content && (
              <div className="p-3 bg-white rounded border-l-2 border-red-200">
                <p className="text-sm text-gray-600">{data.post_content}</p>
              </div>
            )}
          </div>
        );
      
      case 'followed_user':
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={data.followed_user_avatar} />
              <AvatarFallback>{data.followed_user_name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{data.followed_user_name}</p>
              <p className="text-xs text-muted-foreground">@{data.followed_user_username}</p>
            </div>
          </div>
        );
      
      case 'achievement_earned':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {data.achievement_name}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{data.achievement_description}</p>
          </div>
        );
      
      case 'rating_given':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < data.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{data.rating}/5</span>
            </div>
            <p className="text-sm">{activity.activity_description}</p>
            {data.comment && (
              <p className="text-sm text-gray-600 italic">"{data.comment}"</p>
            )}
          </div>
        );
      
      default:
        return <p className="text-sm">{activity.activity_description}</p>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No recent activity to show</p>
          {isOwnProfile && (
            <p className="text-sm text-muted-foreground mt-2">
              Your activity will appear here as you interact with the platform
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id} className={`border-l-4 ${getActivityColor(activity.activity_type)}`}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.activity_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {activity.activity_title}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
                {renderActivityContent(activity)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {activities.length >= 20 && (
        <div className="text-center">
          <Button variant="outline" onClick={fetchActivities}>
            Load More Activity
          </Button>
        </div>
      )}
    </div>
  );
};