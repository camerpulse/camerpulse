import React, { useState } from 'react';
import { Calendar, Plus, Clock, Users, Star, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTraditionalEvents, useUpcomingEvents, useVillageCalendarInsights } from '@/hooks/useTraditionalCalendar';
import { TraditionalEventCard } from './TraditionalEventCard';
import { AddEventDialog } from './AddEventDialog';
import { CalendarView } from './CalendarView';

interface TraditionalCalendarHubProps {
  villageId: string;
}

export const TraditionalCalendarHub: React.FC<TraditionalCalendarHubProps> = ({ villageId }) => {
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [selectedFilters, setSelectedFilters] = useState({
    event_type: '',
    calendar_type: '',
    upcoming_only: false,
  });

  const { data: allEvents = [], isLoading } = useTraditionalEvents(villageId, selectedFilters);
  const { data: upcomingEvents = [] } = useUpcomingEvents(villageId);
  const { data: insights } = useVillageCalendarInsights(villageId);

  const formatEventType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPreservationStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'declining': return 'bg-yellow-100 text-yellow-800';
      case 'revived': return 'bg-blue-100 text-blue-800';
      case 'modernized': return 'bg-purple-100 text-purple-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Traditional Calendar</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Traditional Calendar
          </h2>
          <p className="text-muted-foreground">
            Preserve and celebrate cultural events, festivals, and ceremonies
          </p>
        </div>
        <Button onClick={() => setShowAddEvent(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Statistics Overview */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{insights.totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Events</p>
                  <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Cultural Events</p>
                  <p className="text-2xl font-bold">{insights.byCategory.cultural || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Traditions</p>
                  <p className="text-2xl font-bold">{insights.byPreservationStatus.active || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {allEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Traditional Events Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start documenting your village's cultural calendar and traditional celebrations
                </p>
                <Button onClick={() => setShowAddEvent(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {allEvents.map((event: any) => (
                <TraditionalEventCard
                  key={event.id}
                  event={event}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Upcoming Events</h3>
                <p className="text-sm text-muted-foreground">
                  There are no traditional events scheduled for the next 30 days
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {upcomingEvents.map((event: any) => (
                <TraditionalEventCard
                  key={event.id}
                  event={event}
                  showCountdown
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traditional Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarView
                events={allEvents}
                villageId={villageId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights && Object.entries(insights.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm">{formatEventType(type)}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calendar Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights && Object.entries(insights.byCalendarType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm">{formatEventType(type)}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights && Object.entries(insights.byCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm">{formatEventType(category)}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preservation Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights && Object.entries(insights.byPreservationStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm">{formatEventType(status)}</span>
                    <Badge className={getPreservationStatusColor(status)}>
                      {count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AddEventDialog
        open={showAddEvent}
        onOpenChange={setShowAddEvent}
        villageId={villageId}
      />
    </div>
  );
};