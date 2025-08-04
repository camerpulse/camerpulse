import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Settings,
  AlertTriangle,
  Info,
  MessageSquare,
  Building,
  Vote,
  Briefcase,
  ShoppingCart,
  Users,
  Shield,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useUnifiedNotifications } from '@/hooks/useUnifiedNotifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  onPreferencesClick?: () => void;
}

export const UnifiedNotificationCenter: React.FC<NotificationCenterProps> = ({
  onPreferencesClick
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    getNotificationsByCategory,
    getHighPriorityNotifications 
  } = useUnifiedNotifications();
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState('all');

  const getNotificationIcon = (type: string, sourceModule: string) => {
    // Priority-based icons
    if (type.includes('alert') || type.includes('urgent')) return AlertTriangle;
    if (type.includes('security')) return Shield;
    
    // Module-based icons
    switch (sourceModule) {
      case 'civic_alerts': return Vote;
      case 'petitions': return Vote;
      case 'villages': return Users;
      case 'jobs': return Briefcase;
      case 'marketplace': return ShoppingCart;
      case 'community': return MessageSquare;
      case 'admin': return Building;
      case 'security': return Shield;
      default: return Bell;
    }
  };

  const getNotificationColor = (priority: number, category: string) => {
    if (priority <= 2) return 'text-red-500'; // High priority
    if (priority === 3) return 'text-yellow-500'; // Medium priority
    
    // Category-based colors for low priority
    switch (category) {
      case 'civic': return 'text-blue-500';
      case 'community': return 'text-green-500';
      case 'jobs': return 'text-purple-500';
      case 'marketplace': return 'text-orange-500';
      case 'admin': return 'text-gray-500';
      case 'security': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority === 1) return { label: 'Critical', variant: 'destructive' as const };
    if (priority === 2) return { label: 'High', variant: 'destructive' as const };
    if (priority === 3) return { label: 'Medium', variant: 'secondary' as const };
    return null;
  };

  const getFilteredNotifications = () => {
    switch (selectedTab) {
      case 'unread':
        return notifications.filter(n => !n.read_at);
      case 'priority':
        return getHighPriorityNotifications();
      case 'civic':
        return getNotificationsByCategory('civic');
      case 'community':
        return getNotificationsByCategory('community');
      case 'jobs':
        return getNotificationsByCategory('jobs');
      case 'marketplace':
        return getNotificationsByCategory('marketplace');
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const categoryUnreadCounts = {
    civic: getNotificationsByCategory('civic').filter(n => !n.read_at).length,
    community: getNotificationsByCategory('community').filter(n => !n.read_at).length,
    jobs: getNotificationsByCategory('jobs').filter(n => !n.read_at).length,
    marketplace: getNotificationsByCategory('marketplace').filter(n => !n.read_at).length,
    priority: getHighPriorityNotifications().length,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96 max-h-[600px]">
        <DropdownMenuLabel className="flex items-center justify-between py-3">
          <span className="font-semibold">{t('dashboard.notifications')}</span>
          <div className="flex gap-2">
            {onPreferencesClick && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onPreferencesClick}
                className="h-6 px-2 text-xs"
              >
                <Settings className="h-3 w-3" />
              </Button>
            )}
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="h-6 px-2 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3 text-xs">
              <TabsTrigger value="all" className="text-xs">
                All
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 text-xs p-0">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-4 w-4 text-xs p-0">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="priority" className="text-xs">
                Priority
                {categoryUnreadCounts.priority > 0 && (
                  <Badge variant="destructive" className="ml-1 h-4 w-4 text-xs p-0">
                    {categoryUnreadCounts.priority}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="mt-2 flex gap-1 flex-wrap">
              <Button
                variant={selectedTab === 'civic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTab('civic')}
                className="text-xs h-6"
              >
                <Vote className="h-3 w-3 mr-1" />
                Civic
                {categoryUnreadCounts.civic > 0 && (
                  <Badge variant="secondary" className="ml-1 h-3 w-3 text-xs p-0">
                    {categoryUnreadCounts.civic}
                  </Badge>
                )}
              </Button>
              <Button
                variant={selectedTab === 'community' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTab('community')}
                className="text-xs h-6"
              >
                <Users className="h-3 w-3 mr-1" />
                Community
                {categoryUnreadCounts.community > 0 && (
                  <Badge variant="secondary" className="ml-1 h-3 w-3 text-xs p-0">
                    {categoryUnreadCounts.community}
                  </Badge>
                )}
              </Button>
              <Button
                variant={selectedTab === 'jobs' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTab('jobs')}
                className="text-xs h-6"
              >
                <Briefcase className="h-3 w-3 mr-1" />
                Jobs
                {categoryUnreadCounts.jobs > 0 && (
                  <Badge variant="secondary" className="ml-1 h-3 w-3 text-xs p-0">
                    {categoryUnreadCounts.jobs}
                  </Badge>
                )}
              </Button>
              <Button
                variant={selectedTab === 'marketplace' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTab('marketplace')}
                className="text-xs h-6"
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Market
                {categoryUnreadCounts.marketplace > 0 && (
                  <Badge variant="secondary" className="ml-1 h-3 w-3 text-xs p-0">
                    {categoryUnreadCounts.marketplace}
                  </Badge>
                )}
              </Button>
            </div>
          </Tabs>
        </div>

        <DropdownMenuSeparator />
        
        <ScrollArea className="h-80">
          {filteredNotifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {selectedTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type, notification.source_module);
              const iconColor = getNotificationColor(notification.priority, notification.category);
              const priorityBadge = getPriorityBadge(notification.priority);
              const isExpired = notification.expires_at && new Date(notification.expires_at) < new Date();
              
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "p-4 cursor-pointer block",
                    !notification.read_at && "bg-primary/5",
                    isExpired && "opacity-60"
                  )}
                  onClick={() => {
                    if (!notification.read_at) {
                      markAsRead(notification.id);
                    }
                    if (notification.action_url) {
                      window.location.href = notification.action_url;
                    }
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className={cn(
                      "w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0",
                      notification.priority <= 2 && "bg-red-100 dark:bg-red-900/20"
                    )}>
                      <Icon className={cn("h-4 w-4", iconColor)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {priorityBadge && (
                            <Badge variant={priorityBadge.variant} className="text-xs py-0 px-1">
                              {priorityBadge.label}
                            </Badge>
                          )}
                          {!notification.read_at && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                          {notification.action_url && (
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.body}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          {notification.source_module !== 'system' && (
                            <Badge variant="outline" className="text-xs py-0 px-1">
                              {notification.source_module}
                            </Badge>
                          )}
                        </div>
                        
                        {notification.requires_action && (
                          <Badge variant="secondary" className="text-xs py-0">
                            Action Required
                          </Badge>
                        )}
                      </div>

                      {isExpired && (
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs py-0 text-muted-foreground">
                            Expired
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
        
        {filteredNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center p-2">
              <Button variant="ghost" size="sm" className="w-full">
                View all notifications
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};