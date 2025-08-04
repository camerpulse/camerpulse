import React, { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCheck, 
  Clock,
  AlertTriangle,
  Users,
  MessageCircle,
  Calendar,
  Megaphone,
  TrendingUp,
  Vote,
  ShieldCheck,
  Settings,
  X
} from 'lucide-react';
import { useNotifications, type PulseNotification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    dismissNotification,
    snoozeNotifications 
  } = useNotifications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getNotificationIcon = (notification: PulseNotification) => {
    const iconMap = {
      message: <MessageCircle className="h-5 w-5 text-blue-500" />,
      follow: <Users className="h-5 w-5 text-green-500" />,
      profile_view: <Users className="h-5 w-5 text-purple-500" />,
      tag: <Bell className="h-5 w-5 text-orange-500" />,
      event_nearby: <Calendar className="h-5 w-5 text-primary" />,
      poll_new: <Vote className="h-5 w-5 text-primary" />,
      government_notice: <Megaphone className="h-5 w-5 text-red-500" />,
      policy_update: <ShieldCheck className="h-5 w-5 text-indigo-500" />,
      promise_update: <TrendingUp className="h-5 w-5 text-emerald-500" />,
      sentiment_alert: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      election_update: <Vote className="h-5 w-5 text-purple-600" />,
      verification_approved: <ShieldCheck className="h-5 w-5 text-green-600" />,
      post_deleted: <X className="h-5 w-5 text-red-600" />,
      profile_issue: <AlertTriangle className="h-5 w-5 text-orange-600" />,
      feature_unlocked: <Settings className="h-5 w-5 text-blue-600" />,
      broadcast: <Megaphone className="h-5 w-5 text-red-500" />,
    };
    
    return iconMap[notification.notification_type] || <Bell className="h-5 w-5 text-muted-foreground" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20';
      case 'moderate': return 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20';
      case 'low': return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20';
      default: return 'border-l-muted';
    }
  };

  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === 'unread') return !notification.is_read;
      if (filter === 'critical') return notification.priority === 'critical';
      return true;
    })
    .filter(notification => {
      if (!searchQuery) return true;
      return (
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  const handleNotificationClick = (notification: PulseNotification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Bell className="h-8 w-8" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-2">
                    {unreadCount} unread
                  </Badge>
                )}
              </h1>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button onClick={markAllAsRead} variant="outline">
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark all read
                  </Button>
                )}
                
                <Button variant="outline" onClick={() => snoozeNotifications('1h')}>
                  <Clock className="h-4 w-4 mr-2" />
                  Snooze 1h
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <Tabs value={filter} onValueChange={(value: any) => setFilter(value)} className="w-full">
              <TabsList>
                <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread ({notifications.filter(n => !n.is_read).length})
                </TabsTrigger>
                <TabsTrigger value="critical">
                  Critical ({notifications.filter(n => n.priority === 'critical').length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No matching notifications' : 
                   filter === 'unread' ? 'No unread notifications' :
                   filter === 'critical' ? 'No critical notifications' :
                   'No notifications yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search terms' :
                   filter === 'all' ? 'New notifications will appear here' :
                   'Check back later for updates'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-l-4 transition-all hover:bg-accent/50 cursor-pointer group ${
                    !notification.is_read 
                      ? `${getPriorityColor(notification.priority)} border-border` 
                      : 'bg-background border-border hover:border-accent'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.is_read && (
                            <div className="w-3 h-3 bg-primary rounded-full" />
                          )}
                          
                          {notification.priority === 'critical' && (
                            <Badge variant="destructive">Critical</Badge>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                        <span className="capitalize">{notification.notification_type.replace('_', ' ')}</span>
                        {notification.geo_targeted && notification.target_regions?.length && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            📍 {notification.target_regions.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;