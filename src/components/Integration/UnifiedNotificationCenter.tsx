import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Bell, 
  Music, 
  Calendar, 
  Award, 
  Shield, 
  TrendingUp, 
  MessageCircle, 
  DollarSign,
  Eye,
  EyeOff,
  Check,
  CheckCheck,
  Trash2,
  Settings
} from 'lucide-react';

interface Notification {
  id: string;
  fan_id: string;
  notification_type: string;
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  priority: string;
  data?: any;
  created_at: string;
  expires_at?: string;
}

interface NotificationPreferences {
  id: string;
  fan_id: string;
  notification_type: string;
  enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  frequency: string;
}

export const UnifiedNotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  // Notifications query
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id, activeTab, showOnlyUnread],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('fan_notifications')
        .select('*')
        .eq('fan_id', user.id)
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('notification_type', activeTab);
      }

      if (showOnlyUnread) {
        query = query.eq('is_read', false);
      }

      const { data } = await query.limit(50);
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Notification preferences query
  const { data: preferences = [] } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data } = await supabase
        .from('artist_notification_preferences')
        .select('*')
        .eq('user_id', user.id);

      return data || [];
    },
    enabled: !!user?.id
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const { error } = await supabase
        .from('fan_notifications')
        .update({ is_read: true })
        .in('id', notificationIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('fan_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Notification deleted",
        description: "The notification has been removed.",
      });
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async ({ type, enabled }: { type: string; enabled: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('artist_notification_preferences')
        .upsert({
          user_id: user.id,
          notification_type: type,
          enabled,
          email_enabled: enabled,
          push_enabled: enabled,
          frequency: 'immediate'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
    }
  });

  // Real-time notifications setup
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fan_notifications',
          filter: `fan_id=eq.${user.id}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          
          // Show toast for high priority notifications
          if (payload.new.priority === 'high') {
            toast({
              title: payload.new.title,
              description: payload.new.message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const notificationTypes = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'music_release', label: 'Music', icon: Music },
    { id: 'event_reminder', label: 'Events', icon: Calendar },
    { id: 'award_update', label: 'Awards', icon: Award },
    { id: 'brand_campaign', label: 'Campaigns', icon: TrendingUp },
    { id: 'fan_interaction', label: 'Interactions', icon: MessageCircle },
    { id: 'payment_update', label: 'Payments', icon: DollarSign },
    { id: 'security_alert', label: 'Security', icon: Shield }
  ];

  const getNotificationIcon = (type: string, priority: string) => {
    const typeConfig = notificationTypes.find(t => t.id === type);
    const IconComponent = typeConfig?.icon || Bell;
    
    const colorClass = priority === 'high' ? 'text-red-500' :
                      priority === 'medium' ? 'text-yellow-500' :
                      'text-blue-500';
    
    return <IconComponent className={`w-5 h-5 ${colorClass}`} />;
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      high: { label: 'High', variant: 'destructive' as const },
      medium: { label: 'Medium', variant: 'default' as const },
      low: { label: 'Low', variant: 'secondary' as const }
    };

    const { label, variant } = config[priority as keyof typeof config] || config.low;
    return <Badge variant={variant} className="text-xs">{label}</Badge>;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate([notification.id]);
    }

    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const markAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length > 0) {
      markAsReadMutation.mutate(unreadIds);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please sign in to view notifications.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-2">{unreadCount}</Badge>
                )}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOnlyUnread(!showOnlyUnread)}
              >
                {showOnlyUnread ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showOnlyUnread ? 'Show All' : 'Unread Only'}
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={markAsReadMutation.isPending}
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Notification Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          {notificationTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id} className="text-xs">
              <type.icon className="w-4 h-4 mr-1" />
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {showOnlyUnread ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {showOnlyUnread 
                    ? 'All caught up! Your unread notifications will appear here.'
                    : 'Your notifications will appear here when you have them.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.is_read ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notification.notification_type, notification.priority)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </h4>
                            {getPriorityBadge(notification.priority)}
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{new Date(notification.created_at).toLocaleString()}</span>
                            {notification.expires_at && (
                              <span>Expires: {new Date(notification.expires_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {notification.action_url && (
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotificationMutation.mutate(notification.id);
                          }}
                          disabled={deleteNotificationMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationTypes.slice(1).map((type) => {
              const preference = preferences.find((p: any) => p.notification_type === type.id);
              const enabled = preference?.enabled ?? true;

              return (
                <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <type.icon className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about {type.label.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => updatePreferencesMutation.mutate({ 
                      type: type.id, 
                      enabled: !enabled 
                    })}
                    disabled={updatePreferencesMutation.isPending}
                  >
                    {enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedNotificationCenter;