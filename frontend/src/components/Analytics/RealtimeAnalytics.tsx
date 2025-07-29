import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationAnalytics } from '@/hooks/useNotificationAnalytics';
import { Activity, Clock, User, MousePointer, Eye, Bell } from 'lucide-react';
import { format } from 'date-fns';

export const RealtimeAnalytics: React.FC = () => {
  const { realtimeEvents, trackEvent } = useNotificationAnalytics();
  const [liveEvents, setLiveEvents] = useState<any[]>([]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance of new event every 5 seconds
        const eventTypes = ['notification_sent', 'notification_opened', 'notification_clicked', 'user_login', 'page_view'];
        const categories = ['notification', 'engagement', 'system', 'user'];
        
        const mockEvent = {
          id: crypto.randomUUID(),
          event_name: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          event_category: categories[Math.floor(Math.random() * categories.length)],
          timestamp: new Date().toISOString(),
          event_data: { 
            mock: true,
            value: Math.floor(Math.random() * 100)
          }
        };

        setLiveEvents(prev => [mockEvent, ...prev.slice(0, 19)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Merge real events with live demo events
  const allEvents = [...liveEvents, ...realtimeEvents.slice(0, 20)];

  const getEventIcon = (eventName: string) => {
    if (eventName.includes('notification_sent') || eventName.includes('sent')) return <Bell className="h-4 w-4 text-primary" />;
    if (eventName.includes('notification_opened') || eventName.includes('opened')) return <Eye className="h-4 w-4 text-success" />;
    if (eventName.includes('notification_clicked') || eventName.includes('clicked')) return <MousePointer className="h-4 w-4 text-warning" />;
    if (eventName.includes('user') || eventName.includes('login')) return <User className="h-4 w-4 text-accent" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  const getEventColor = (category: string) => {
    switch (category) {
      case 'notification': return 'bg-primary/10 text-primary border-primary/20';
      case 'engagement': return 'bg-success/10 text-success border-success/20';
      case 'system': return 'bg-warning/10 text-warning border-warning/20';
      case 'user': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatEventName = (eventName: string) => {
    return eventName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Demo stats
  const stats = {
    eventsPerMinute: Math.floor(Math.random() * 20) + 5,
    activeUsers: Math.floor(Math.random() * 100) + 50,
    notificationsSent: Math.floor(Math.random() * 500) + 200,
    currentEngagement: Math.floor(Math.random() * 30) + 60
  };

  return (
    <div className="space-y-6">
      {/* Real-time stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Events/min</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.eventsPerMinute}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Sent Today</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.notificationsSent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Engagement</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.currentEngagement}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Live event feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            Live Event Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {allEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No events yet</p>
                <p className="text-sm">Events will appear here in real-time</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allEvents.map((event, index) => (
                  <div
                    key={event.id || index}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getEventIcon(event.event_name)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {formatEventName(event.event_name)}
                        </span>
                        <Badge className={getEventColor(event.event_category)}>
                          {event.event_category}
                        </Badge>
                        {event.event_data?.mock && (
                          <Badge variant="outline" className="text-xs">
                            Demo
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(event.timestamp), 'HH:mm:ss')}
                        {event.event_data && Object.keys(event.event_data).length > 0 && (
                          <span className="ml-2">
                            {Object.entries(event.event_data)
                              .filter(([key]) => key !== 'mock')
                              .slice(0, 2)
                              .map(([key, value]) => (
                                <span key={key} className="mr-2">
                                  {key}: {String(value)}
                                </span>
                              ))
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {format(new Date(event.timestamp), 'MMM dd')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};