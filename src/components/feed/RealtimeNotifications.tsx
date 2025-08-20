import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  X,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface RealtimeNotification {
  id: string;
  type: 'like' | 'comment' | 'share' | 'follow' | 'mention' | 'system' | 'breaking';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actor?: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  metadata?: {
    post_id?: string;
    comment_id?: string;
    url?: string;
  };
}

export const RealtimeNotifications: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    // Load initial notifications
    loadNotifications();

    // Set up realtime subscription
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      // Mock notifications - in real app, fetch from Supabase
      const mockNotifications: RealtimeNotification[] = [
        {
          id: '1',
          type: 'like',
          title: 'New Like',
          message: 'John Doe liked your post about healthcare reform',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          read: false,
          priority: 'low',
          actor: {
            name: 'John Doe',
            avatar: '/api/placeholder/32/32',
            verified: false
          },
          metadata: { post_id: 'post_123' }
        },
        {
          id: '2',
          type: 'breaking',
          title: 'Breaking News',
          message: 'Emergency session called in National Assembly',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          read: false,
          priority: 'urgent',
          metadata: { url: '/news/breaking-123' }
        },
        {
          id: '3',
          type: 'comment',
          title: 'New Comment',
          message: 'Sarah replied to your comment on education funding',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          read: true,
          priority: 'medium',
          actor: {
            name: 'Sarah Mbamalu',
            avatar: '/api/placeholder/32/32',
            verified: true
          }
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('broadcast', { event: 'notification' }, (payload) => {
        const newNotification = payload.payload as RealtimeNotification;
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast for high priority notifications
        if (newNotification.priority === 'high' || newNotification.priority === 'urgent') {
          toast({
            title: newNotification.title,
            description: newNotification.message,
            duration: 5000,
          });
        }
      })
      .subscribe();

    channelRef.current = channel;

    // Simulate incoming notifications
    setTimeout(() => {
      simulateRealTimeNotification();
    }, 10000);
  };

  const simulateRealTimeNotification = () => {
    const mockNotification: RealtimeNotification = {
      id: `sim_${Date.now()}`,
      type: 'mention',
      title: 'You were mentioned',
      message: 'Dr. Paul mentioned you in a discussion about rural healthcare',
      timestamp: new Date(),
      read: false,
      priority: 'medium',
      actor: {
        name: 'Dr. Paul Ngole',
        avatar: '/api/placeholder/32/32',
        verified: true
      }
    };

    setNotifications(prev => [mockNotification, ...prev.slice(0, 19)]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === id);
      return notification && !notification.read ? prev - 1 : prev;
    });
  };

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'urgent') return <AlertTriangle className="w-4 h-4 text-red-500" />;
    
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'share': return <Share2 className="w-4 h-4 text-green-500" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-purple-500" />;
      case 'mention': return <Sparkles className="w-4 h-4 text-yellow-500" />;
      case 'breaking': return <Zap className="w-4 h-4 text-orange-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-200 bg-red-50';
      case 'high': return 'border-orange-200 bg-orange-50';
      case 'medium': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 max-h-96 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-6 px-2 text-xs"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                      !notification.read ? getPriorityColor(notification.priority) : 'border-transparent'
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {notification.actor?.avatar ? (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={notification.actor.avatar} />
                            <AvatarFallback>
                              {notification.actor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{notification.title}</p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(notification.timestamp)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};