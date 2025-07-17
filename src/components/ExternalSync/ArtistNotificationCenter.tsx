import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, BellOff, CheckCircle, Copyright, Music, TrendingUp, Trophy, DollarSign, MessageCircle, BarChart3, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  priority: string;
  action_url?: string;
  created_at: string;
}

interface NotificationPreference {
  id: string;
  notification_type: string;
  enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
}

const notificationTypes = {
  'copyright_violation': { icon: Copyright, label: 'Copyright Violations', color: 'destructive' },
  'stream_milestone': { icon: Music, label: 'Stream Milestones', color: 'success' },
  'viral_spike': { icon: TrendingUp, label: 'Viral Spikes', color: 'warning' },
  'award_nomination': { icon: Trophy, label: 'Award Nominations', color: 'civic' },
  'tip_received': { icon: DollarSign, label: 'Tips Received', color: 'success' },
  'fan_comment': { icon: MessageCircle, label: 'Fan Comments', color: 'secondary' },
  'chart_appearance': { icon: BarChart3, label: 'Chart Appearances', color: 'civic' },
  'platform_sync_error': { icon: BellOff, label: 'Platform Sync Errors', color: 'destructive' },
};

export function ArtistNotificationCenter() {
  const [activeTab, setActiveTab] = useState('notifications');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['artist-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artist_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as Notification[];
    }
  });

  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artist_notification_preferences')
        .select('*');
      
      if (error) throw error;
      return data as NotificationPreference[];
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('artist_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('artist_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "All notifications marked as read",
        description: "Your notification center has been cleared.",
      });
      queryClient.invalidateQueries({ queryKey: ['artist-notifications'] });
    }
  });

  const updatePreferenceMutation = useMutation({
    mutationFn: async ({ type, field, value }: { type: string; field: string; value: boolean }) => {
      const { error } = await supabase
        .from('artist_notification_preferences')
        .update({ [field]: value })
        .eq('notification_type', type as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    }
  });

  const getNotificationIcon = (type: string) => {
    const config = notificationTypes[type as keyof typeof notificationTypes];
    if (!config) return Bell;
    return config.icon;
  };

  const getNotificationColor = (type: string) => {
    const config = notificationTypes[type as keyof typeof notificationTypes];
    return config?.color || 'secondary';
  };

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  if (notificationsLoading || preferencesLoading) {
    return <div className="flex items-center justify-center p-8">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notification Center</h2>
          <p className="text-muted-foreground">
            Stay updated on your music performance, copyright alerts, and fan engagement
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="relative">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {notifications && notifications.length > 0 ? (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.notification_type);
                  const color = getNotificationColor(notification.notification_type);
                  
                  return (
                    <Card 
                      key={notification.id} 
                      className={`cursor-pointer transition-colors ${
                        !notification.is_read ? 'border-primary/50 bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsReadMutation.mutate(notification.id);
                        }
                        if (notification.action_url) {
                          window.open(notification.action_url, '_blank');
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full bg-${color}/10`}>
                            <IconComponent className={`h-4 w-4 text-${color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm leading-none">
                                {notification.title}
                              </h4>
                              {!notification.is_read && (
                                <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </span>
                              <Badge variant={color as any} className="text-xs">
                                {notificationTypes[notification.notification_type as keyof typeof notificationTypes]?.label || notification.notification_type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
                <p className="text-muted-foreground text-center">
                  You're all caught up! New notifications will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive and how you want to receive them
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notificationTypes).map(([type, config]) => {
                const preference = preferences?.find(p => p.notification_type === type);
                const IconComponent = config.icon;
                
                return (
                  <div key={type} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5" />
                      <div className="flex-1">
                        <h4 className="font-medium">{config.label}</h4>
                        <p className="text-sm text-muted-foreground">
                          Get notified about {config.label.toLowerCase()}
                        </p>
                      </div>
                      <Switch
                        checked={preference?.enabled ?? true}
                        onCheckedChange={(checked) => 
                          updatePreferenceMutation.mutate({ 
                            type, 
                            field: 'enabled', 
                            value: checked 
                          })
                        }
                      />
                    </div>
                    
                    {preference?.enabled && (
                      <div className="ml-8 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`email-${type}`} className="text-sm">Email notifications</Label>
                          <Switch
                            id={`email-${type}`}
                            checked={preference?.email_enabled ?? true}
                            onCheckedChange={(checked) => 
                              updatePreferenceMutation.mutate({ 
                                type, 
                                field: 'email_enabled', 
                                value: checked 
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`push-${type}`} className="text-sm">Push notifications</Label>
                          <Switch
                            id={`push-${type}`}
                            checked={preference?.push_enabled ?? true}
                            onCheckedChange={(checked) => 
                              updatePreferenceMutation.mutate({ 
                                type, 
                                field: 'push_enabled', 
                                value: checked 
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}