import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdvancedNotifications } from '@/hooks/useAdvancedNotifications';
import { Calendar, Clock, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export const ScheduledNotificationManager: React.FC = () => {
  const { scheduledNotifications, cancelScheduledNotification, loading } = useAdvancedNotifications();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'sent':
        return 'bg-success/10 text-success border-success/20';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'cancelled':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleCancel = async (notificationId: string) => {
    await cancelScheduledNotification(notificationId);
  };

  const groupedNotifications = scheduledNotifications.reduce((acc, notification) => {
    if (!acc[notification.status]) {
      acc[notification.status] = [];
    }
    acc[notification.status].push(notification);
    return acc;
  }, {} as Record<string, typeof scheduledNotifications>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Scheduled Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {scheduledNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No scheduled notifications</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-6">
              {Object.entries(groupedNotifications).map(([status, notifications]) => (
                <div key={status}>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    {getStatusIcon(status)}
                    {status.charAt(0).toUpperCase() + status.slice(1)} 
                    <Badge variant="secondary" className="ml-auto">
                      {notifications.length}
                    </Badge>
                  </h3>
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                          </div>
                          <Badge className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(notification.scheduled_for), 'MMM dd, yyyy HH:mm')}
                            </div>
                            <Badge variant="outline">
                              {notification.notification_type}
                            </Badge>
                            <Badge 
                              variant={notification.priority === 'critical' ? 'destructive' : 'default'}
                            >
                              {notification.priority}
                            </Badge>
                          </div>

                          {notification.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancel(notification.id)}
                              disabled={loading}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>

                        {notification.error_message && (
                          <div className="p-2 bg-destructive/10 text-destructive text-xs rounded border">
                            <strong>Error:</strong> {notification.error_message}
                            {notification.retry_count > 0 && (
                              <span className="ml-2">
                                (Retry {notification.retry_count}/{notification.max_retries})
                              </span>
                            )}
                          </div>
                        )}

                        {notification.sent_at && (
                          <div className="text-xs text-muted-foreground">
                            Sent: {format(new Date(notification.sent_at), 'MMM dd, yyyy HH:mm')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};