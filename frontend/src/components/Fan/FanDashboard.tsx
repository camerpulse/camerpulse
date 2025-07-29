import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Trophy, Music, Calendar, Wallet, Heart, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface FanProfile {
  id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  total_activity_points: number;
  current_rank: number;
  total_spent_fcfa: number;
  total_votes_cast: number;
  total_events_attended: number;
  favorite_genres: string[];
  is_verified: boolean;
}

interface SavedContent {
  id: string;
  content_type: string;
  content_title: string;
  artist_name: string;
  saved_at: string;
}

interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  action_url: string;
  is_read: boolean;
  priority: string;
  created_at: string;
}

interface Activity {
  id: string;
  activity_type: string;
  points_earned: number;
  reference_name: string;
  created_at: string;
}

export const FanDashboard: React.FC = () => {
  const { user } = useAuth();
  const [fanProfile, setFanProfile] = useState<FanProfile | null>(null);
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFanProfile();
      fetchSavedContent();
      fetchNotifications();
      fetchRecentActivities();
    }
  }, [user]);

  const fetchFanProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('fan_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching fan profile:', error);
        return;
      }

      if (data) {
        setFanProfile(data);
      } else {
        // Create fan profile if it doesn't exist
        await createFanProfile();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createFanProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('fan_profiles')
        .insert({
          user_id: user?.id,
          display_name: user?.email?.split('@')[0] || 'Fan',
        })
        .select()
        .single();

      if (error) throw error;
      setFanProfile(data);
    } catch (error) {
      console.error('Error creating fan profile:', error);
    }
  };

  const fetchSavedContent = async () => {
    if (!fanProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('fan_saved_content')
        .select('*')
        .eq('fan_id', fanProfile.id)
        .order('saved_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSavedContent(data || []);
    } catch (error) {
      console.error('Error fetching saved content:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!fanProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('fan_notifications')
        .select('*')
        .eq('fan_id', fanProfile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchRecentActivities = async () => {
    if (!fanProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('fan_activities')
        .select('*')
        .eq('fan_id', fanProfile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentActivities(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('fan_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'stream': return <Music className="h-4 w-4" />;
      case 'vote': return <Trophy className="h-4 w-4" />;
      case 'event_attendance': return <Calendar className="h-4 w-4" />;
      case 'purchase': return <Wallet className="h-4 w-4" />;
      case 'donation': return <Heart className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!fanProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p>Setting up your fan profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {fanProfile.display_name}!</h1>
            <p className="text-muted-foreground">Your CamerPulse fan dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            {fanProfile.is_verified && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" />
                Verified Fan
              </Badge>
            )}
            <Badge variant="outline">
              Rank #{fanProfile.current_rank || 'Unranked'}
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{fanProfile.total_activity_points}</p>
                  <p className="text-sm text-muted-foreground">Activity Points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{fanProfile.total_votes_cast}</p>
                  <p className="text-sm text-muted-foreground">Votes Cast</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{fanProfile.total_events_attended}</p>
                  <p className="text-sm text-muted-foreground">Events Attended</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Wallet className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{fanProfile.total_spent_fcfa.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">FCFA Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="saved">Saved Content</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {notifications.filter(n => !n.is_read).length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {notifications.filter(n => !n.is_read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        {getActivityIcon(activity.activity_type)}
                        <div className="flex-1">
                          <p className="font-medium capitalize">{activity.activity_type.replace('_', ' ')}</p>
                          {activity.reference_name && (
                            <p className="text-sm text-muted-foreground">{activity.reference_name}</p>
                          )}
                        </div>
                        <Badge variant="outline">+{activity.points_earned}pts</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Progress to Next Level */}
              <Card>
                <CardHeader>
                  <CardTitle>Fan Level Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Current Level: {Math.floor(fanProfile.total_activity_points / 100) + 1}</span>
                      <span>Next Level: {Math.floor(fanProfile.total_activity_points / 100) + 2}</span>
                    </div>
                    <Progress 
                      value={(fanProfile.total_activity_points % 100)} 
                      className="h-3"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {100 - (fanProfile.total_activity_points % 100)} points to next level
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Favorite Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {fanProfile.favorite_genres?.length > 0 ? (
                        fanProfile.favorite_genres.map((genre) => (
                          <Badge key={genre} variant="secondary">{genre}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No favorite genres set</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Saved Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedContent.length > 0 ? (
                  <div className="space-y-4">
                    {savedContent.map((content) => (
                      <div key={content.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Music className="h-8 w-8 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{content.content_title}</p>
                          <p className="text-sm text-muted-foreground">
                            {content.artist_name} • {content.content_type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Saved {new Date(content.saved_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">{content.content_type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No saved content yet</p>
                    <p className="text-sm text-muted-foreground">Start following artists and saving music!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          notification.is_read ? 'bg-muted/30' : 'bg-background border-primary/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{notification.title}</h4>
                              <Badge variant={getPriorityColor(notification.priority) as any} className="text-xs">
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No notifications yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Activity History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        {getActivityIcon(activity.activity_type)}
                        <div className="flex-1">
                          <p className="font-medium capitalize">{activity.activity_type.replace('_', ' ')}</p>
                          {activity.reference_name && (
                            <p className="text-sm text-muted-foreground">{activity.reference_name}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline">+{activity.points_earned} points</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No activity yet</p>
                    <p className="text-sm text-muted-foreground">Start engaging to see your activity history!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};