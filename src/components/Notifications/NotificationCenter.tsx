import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  CheckCheck, 
  X, 
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
  Filter
 } from 'lucide-react';
import { useNotifications, type PulseNotification } from '@/hooks/useNotifications';
import { useNavigation } from '@/hooks/useNavigation';

export const NotificationCenter: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { 
    unreadCount, 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    dismissNotification,
    snoozeNotifications 
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  const getNotificationIcon = (notification: PulseNotification) => {
    const iconMap = {
      message: <MessageCircle className="h-4 w-4 text-blue-500" />,
      follow: <Users className="h-4 w-4 text-green-500" />,
      profile_view: <Users className="h-4 w-4 text-purple-500" />,
      tag: <Bell className="h-4 w-4 text-orange-500" />,
      event_nearby: <Calendar className="h-4 w-4 text-primary" />,
      poll_new: <Vote className="h-4 w-4 text-primary" />,
      government_notice: <Megaphone className="h-4 w-4 text-red-500" />,
      policy_update: <ShieldCheck className="h-4 w-4 text-indigo-500" />,
      promise_update: <TrendingUp className="h-4 w-4 text-emerald-500" />,
      sentiment_alert: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      election_update: <Vote className="h-4 w-4 text-purple-600" />,
      verification_approved: <ShieldCheck className="h-4 w-4 text-green-600" />,
      post_deleted: <X className="h-4 w-4 text-red-600" />,
      profile_issue: <AlertTriangle className="h-4 w-4 text-orange-600" />,
      feature_unlocked: <Settings className="h-4 w-4 text-blue-600" />,
      broadcast: <Megaphone className="h-4 w-4 text-red-500" />,
    };
    
    return iconMap[notification.notification_type] || <Bell className="h-4 w-4 text-muted-foreground" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50/50';
      case 'moderate': return 'border-l-yellow-500 bg-yellow-50/50';
      case 'low': return 'border-l-blue-500 bg-blue-50/50';
      default: return 'border-l-muted';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'critical') return notification.priority === 'critical';
    return true;
  });

  const groupedNotifications = {
    today: filteredNotifications.filter(n => {
      const today = new Date();
      const notifDate = new Date(n.created_at);
      return notifDate.toDateString() === today.toDateString();
    }),
    yesterday: filteredNotifications.filter(n => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const notifDate = new Date(n.created_at);
      return notifDate.toDateString() === yesterday.toDateString();
    }),
    older: filteredNotifications.filter(n => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const notifDate = new Date(n.created_at);
      return notifDate < twoDaysAgo;
    })
  };

  const handleNotificationClick = (notification: PulseNotification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      navigateTo(notification.action_url);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white hover:bg-white/10 relative"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-[10px] bg-destructive text-white border-0 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96 p-0 max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Clock className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <div className="p-2">
                    <p className="text-sm font-medium mb-2">Snooze notifications</p>
                    <div className="space-y-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => snoozeNotifications('1h')}
                      >
                        1 hour
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => snoozeNotifications('1d')}
                      >
                        1 day
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => snoozeNotifications('1w')}
                      >
                        1 week
                      </Button>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(value: any) => setFilter(value)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="critical" className="text-xs">Critical</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-96">
          {filteredNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {filter === 'unread' ? 'No unread notifications' : 
                 filter === 'critical' ? 'No critical notifications' : 
                 'No notifications yet'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {filter === 'all' && 'New notifications will appear here'}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {/* Today */}
              {groupedNotifications.today.length > 0 && (
                <>
                  <div className="px-3 py-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Today
                    </h4>
                  </div>
                  {groupedNotifications.today.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onNotificationClick={handleNotificationClick}
                      onDismiss={dismissNotification}
                      getNotificationIcon={getNotificationIcon}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                </>
              )}

              {/* Yesterday */}
              {groupedNotifications.yesterday.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="px-3 py-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Yesterday
                    </h4>
                  </div>
                  {groupedNotifications.yesterday.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onNotificationClick={handleNotificationClick}
                      onDismiss={dismissNotification}
                      getNotificationIcon={getNotificationIcon}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                </>
              )}

              {/* Older */}
              {groupedNotifications.older.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="px-3 py-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Earlier
                    </h4>
                  </div>
                  {groupedNotifications.older.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onNotificationClick={handleNotificationClick}
                      onDismiss={dismissNotification}
                      getNotificationIcon={getNotificationIcon}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/20">
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1" size="sm">
              <Link to="/notifications">
                <Bell className="h-4 w-4 mr-2" />
                View All
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" size="sm">
              <Link to="/notifications/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface NotificationItemProps {
  notification: PulseNotification;
  onNotificationClick: (notification: PulseNotification) => void;
  onDismiss: (id: string) => void;
  getNotificationIcon: (notification: PulseNotification) => React.ReactNode;
  getPriorityColor: (priority: string) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onNotificationClick,
  onDismiss,
  getNotificationIcon,
  getPriorityColor,
}) => {
  return (
    <div
      className={`p-3 rounded-lg border-l-2 transition-all hover:bg-accent/50 cursor-pointer group ${
        !notification.is_read 
          ? `${getPriorityColor(notification.priority)} border-border` 
          : 'bg-background border-border hover:border-accent'
      }`}
      onClick={() => onNotificationClick(notification)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-medium text-sm truncate">
              {notification.title}
            </p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!notification.is_read && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(notification.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { 
                addSuffix: true 
              })}
            </p>
            
            {notification.priority === 'critical' && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                Critical
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};