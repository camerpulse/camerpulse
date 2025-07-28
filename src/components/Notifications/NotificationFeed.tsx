import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  MessageCircle,
  Package,
  Mail,
  Smartphone,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  data: any;
  channels: string[];
  is_read: boolean;
  read_at: string | null;
  sent_via_email: boolean;
  sent_via_sms: boolean;
  sent_via_push: boolean;
  email_sent_at: string | null;
  sms_sent_at: string | null;
  push_sent_at: string | null;
  priority: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const NotificationFeed: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'priority'>('all');

  // Load notifications
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setNotifications((data as any[])?.map(item => ({
          ...item,
          channels: item.channels || []
        })) || []);
      } catch (error) {
        console.error('Error loading notifications:', error);
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user, toast]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notification-feed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time notification update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
            
            // Show toast for new notification
            toast({
              title: newNotification.title,
              description: newNotification.message,
              duration: 5000,
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotification = payload.new as Notification;
            setNotifications(prev => 
              prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_status_change':
      case 'shipment_status_change':
        return Package;
      case 'message_received':
        return MessageCircle;
      case 'system_alert':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return Mail;
      case 'sms':
        return Smartphone;
      case 'push':
        return Bell;
      default:
        return Eye;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.is_read;
      case 'priority':
        return notification.priority === 'high';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
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
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Live Notification Feed
            {notifications.filter(n => !n.is_read).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notifications.filter(n => !n.is_read).length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-primary text-primary-foreground' : ''}
            >
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter('unread')}
              className={filter === 'unread' ? 'bg-primary text-primary-foreground' : ''}
            >
              Unread
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter('priority')}
              className={filter === 'priority' ? 'bg-primary text-primary-foreground' : ''}
            >
              Priority
            </Button>
          </div>
        </div>
        {notifications.filter(n => !n.is_read).length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark All Read
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {filteredNotifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No notifications found
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.notification_type);
                
                return (
                  <div key={notification.id}>
                    <div 
                      className={`p-4 rounded-lg border transition-colors ${
                        !notification.is_read 
                          ? 'bg-primary/5 border-primary/20' 
                          : 'bg-background'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <Icon className={`h-5 w-5 ${
                            !notification.is_read ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className={`font-medium ${
                                !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant={getPriorityColor(notification.priority)}>
                                {notification.priority}
                              </Badge>
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </div>
                            
                            {/* Channel Status Indicators */}
                            <div className="flex items-center gap-2">
                              {notification.channels.map((channel) => {
                                const ChannelIcon = getChannelIcon(channel);
                                const isSent = 
                                  (channel === 'email' && notification.sent_via_email) ||
                                  (channel === 'sms' && notification.sent_via_sms) ||
                                  (channel === 'push' && notification.sent_via_push) ||
                                  channel === 'in_app';
                                  
                                return (
                                  <div key={channel} className="flex items-center gap-1">
                                    <ChannelIcon className={`h-3 w-3 ${
                                      isSent ? 'text-green-500' : 'text-muted-foreground'
                                    }`} />
                                    <span className="capitalize">{channel}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {index < filteredNotifications.length - 1 && (
                      <Separator className="my-3" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};