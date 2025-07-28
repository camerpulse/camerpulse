import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { Calendar, Users, MapPin, Clock, Plus, Eye, Settings } from 'lucide-react';

interface EventManagementModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const EventManagementModule: React.FC<EventManagementModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for demonstration
  const eventStats = {
    totalEvents: stats?.total_events || 45,
    upcomingEvents: stats?.upcoming_events || 12,
    totalAttendees: stats?.total_attendees || 2834,
    activeVenues: stats?.active_venues || 8
  };

  const upcomingEvents = [
    { 
      id: 1, 
      title: 'Village Council Meeting', 
      date: '2024-02-15', 
      time: '10:00 AM',
      location: 'Community Center',
      attendees: 45,
      status: 'confirmed' 
    },
    { 
      id: 2, 
      title: 'Youth Development Workshop', 
      date: '2024-02-18', 
      time: '2:00 PM',
      location: 'School Hall',
      attendees: 78,
      status: 'pending' 
    },
    { 
      id: 3, 
      title: 'Cultural Festival', 
      date: '2024-02-22', 
      time: '9:00 AM',
      location: 'Central Park',
      attendees: 234,
      status: 'confirmed' 
    },
    { 
      id: 4, 
      title: 'Health Awareness Campaign', 
      date: '2024-02-25', 
      time: '11:00 AM',
      location: 'Health Center',
      attendees: 56,
      status: 'draft' 
    }
  ];

  const eventCategories = [
    { name: 'Government', count: 12, color: 'bg-blue-100 text-blue-800' },
    { name: 'Cultural', count: 8, color: 'bg-purple-100 text-purple-800' },
    { name: 'Educational', count: 15, color: 'bg-green-100 text-green-800' },
    { name: 'Community', count: 10, color: 'bg-orange-100 text-orange-800' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'draft': return 'text-gray-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Event Management"
        description="Manage community events, calendar, and attendee registration"
        icon={Calendar}
        iconColor="text-indigo-600"
        searchPlaceholder="Search events, venues, organizers..."
        onSearch={(query) => {
          console.log('Searching events:', query);
        }}
        onRefresh={() => {
          logActivity('events_refresh', { timestamp: new Date() });
        }}
        actions={(
          <Button onClick={() => logActivity('events_create', {})}>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        )}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">All time events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats.totalAttendees}</div>
            <p className="text-xs text-muted-foreground">Registered participants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Venues</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats.activeVenues}</div>
            <p className="text-xs text-muted-foreground">Available locations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>
              Events scheduled for the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.attendees} attendees registered
                    </p>
                  </div>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Events
            </Button>
          </CardContent>
        </Card>

        {/* Event Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Event Categories
            </CardTitle>
            <CardDescription>
              Distribution by event type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eventCategories.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <span className="font-medium">{category.name}</span>
                  <Badge className={category.color}>
                    {category.count}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-6 space-y-2">
              <Button className="w-full" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
              <Button className="w-full" variant="outline">
                <MapPin className="w-4 h-4 mr-2" />
                Manage Venues
              </Button>
              <Button className="w-full" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                View Attendees
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Management Tools */}
      {hasPermission('events:manage') && (
        <Card>
          <CardHeader>
            <CardTitle>Event Management Tools</CardTitle>
            <CardDescription>
              Advanced tools for event organization and management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => logActivity('events_calendar_view', {})}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar View
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('events_bulk_actions', {})}
              >
                <Settings className="w-4 h-4 mr-2" />
                Bulk Actions
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('events_export', {})}
              >
                <Eye className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('events_analytics', {})}
              >
                <Users className="w-4 h-4 mr-2" />
                Event Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};