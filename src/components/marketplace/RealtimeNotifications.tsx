import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { 
  Bell, 
  BellRing, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingCart,
  X,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface RealtimeNotificationsProps {
  userId: string;
}

export const RealtimeNotifications: React.FC<RealtimeNotificationsProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    allNotifications, 
    markNotificationAsRead,
    inventoryAlerts,
    productUpdates 
  } = useRealtimeUpdates(userId);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'inventory_alert':
        return <Package className="h-4 w-4" />;
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4" />;
      case 'price_change':
        return <TrendingUp className="h-4 w-4" />;
      case 'order_update':
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-200';
      case 'high':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200';
      case 'medium':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200';
      case 'low':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-200';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-200';
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    toast.success('Notification marked as read');
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Notifications ({unreadCount} unread)
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {allNotifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {allNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-l-4 hover:bg-muted/50 transition-colors ${
                        notification.read_at ? 'opacity-60' : ''
                      } ${getPriorityColor(notification.priority)}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getNotificationIcon(notification.notification_type)}
                            <h4 className="text-sm font-medium truncate">
                              {notification.title}
                            </h4>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleTimeString()}
                            </span>
                            {!notification.read_at && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="h-6 px-2 text-xs"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Mark read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Live Updates Section */}
            {(productUpdates.length > 0 || inventoryAlerts.length > 0) && (
              <div className="border-t p-3">
                <h5 className="text-xs font-medium text-muted-foreground mb-2">
                  Live Updates
                </h5>
                
                {productUpdates.slice(0, 3).map((update) => (
                  <div key={update.id} className="flex items-center gap-2 mb-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="truncate">
                      {update.title} updated
                    </span>
                  </div>
                ))}

                {inventoryAlerts.slice(0, 2).map((alert) => (
                  <div key={alert.id} className="flex items-center gap-2 mb-1 text-xs">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    <span className="truncate">
                      {alert.alert_type === 'low_stock' ? 'Low stock' : 'Out of stock'} alert
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};