import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigation } from '@/hooks/useNavigation';

interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  read_at: string | null;
  action_url: string | null;
  priority: string;
  metadata: any;
  created_at: string;
}

const priorityConfig = {
  low: { icon: Info, color: 'bg-blue-500', label: 'Low' },
  medium: { icon: Bell, color: 'bg-yellow-500', label: 'Medium' },
  high: { icon: AlertTriangle, color: 'bg-orange-500', label: 'High' },
  urgent: { icon: Zap, color: 'bg-red-500', label: 'Urgent' }
};

export function ModeratorNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { navigateTo } = useNavigation();

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('moderator-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'moderator_notifications'
        },
        (payload) => {
          console.log('Notification update:', payload);
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // First get the moderator record
      const { data: moderator } = await supabase
        .from('civic_moderators')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!moderator) return;

      const { data, error } = await supabase
        .from('moderator_notifications')
        .select('*')
        .eq('moderator_id', moderator.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId
      });

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter(n => !n.read_at)
      .map(n => n.id);

    for (const id of unreadIds) {
      await markAsRead(id);
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Stay updated on your moderation tasks and system alerts
            </CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const config = priorityConfig[notification.priority as keyof typeof priorityConfig];
                const Icon = config.icon;
                const isUnread = !notification.read_at;

                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      isUnread 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-background'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${config.color} text-white flex-shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-medium ${isUnread ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {config.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-3">
                          {notification.action_url && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigateTo(notification.action_url!)}
                            >
                              View Details
                            </Button>
                          )}
                          {isUnread && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}