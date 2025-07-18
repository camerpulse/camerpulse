import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow, isFuture, isPast } from 'date-fns';

interface VillageEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date: string | null;
  location: string | null;
  event_type: string;
  max_attendees: number | null;
  status: string;
  created_at: string;
  organizer_id: string;
  attendees_count?: number;
  user_attendance?: string;
}

interface VillageEventsProps {
  villageId: string;
}

const eventTypes = [
  { value: 'community', label: 'Community Meeting' },
  { value: 'cultural', label: 'Cultural Event' },
  { value: 'educational', label: 'Educational Workshop' },
  { value: 'religious', label: 'Religious Gathering' },
  { value: 'sports', label: 'Sports Event' },
  { value: 'health', label: 'Health Awareness' },
  { value: 'development', label: 'Development Project' },
  { value: 'celebration', label: 'Celebration' },
];

export const VillageEvents: React.FC<VillageEventsProps> = ({ villageId }) => {
  const [events, setEvents] = useState<VillageEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('upcoming');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    end_date: '',
    location: '',
    event_type: 'community',
    max_attendees: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, [villageId, filter]);

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from('village_events')
        .select(`
          *,
          attendees_count:event_attendees(count)
        `)
        .eq('village_id', villageId);

      // Apply filters
      const now = new Date().toISOString();
      switch (filter) {
        case 'upcoming':
          query = query.gte('event_date', now);
          break;
        case 'past':
          query = query.lt('event_date', now);
          break;
        case 'this_week':
          const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          query = query.gte('event_date', now).lte('event_date', weekFromNow);
          break;
      }

      query = query.order('event_date', { ascending: filter !== 'past' });

      const { data, error } = await query;
      if (error) throw error;

      // Get user attendance status for each event
      const { data: { user } } = await supabase.auth.getUser();
      let eventsWithAttendance: VillageEvent[] = [];

      if (user) {
        const eventIds = data?.map(e => e.id) || [];
        if (eventIds.length > 0) {
          const { data: attendanceData } = await supabase
            .from('event_attendees')
            .select('event_id, attendance_status')
            .eq('user_id', user.id)
            .in('event_id', eventIds);

          eventsWithAttendance = (data || []).map(event => ({
            ...event,
            attendees_count: Array.isArray(event.attendees_count) ? event.attendees_count[0]?.count || 0 : 0,
            user_attendance: attendanceData?.find(a => a.event_id === event.id)?.attendance_status,
          } as VillageEvent));
        } else {
          eventsWithAttendance = (data || []).map(event => ({
            ...event,
            attendees_count: Array.isArray(event.attendees_count) ? event.attendees_count[0]?.count || 0 : 0,
          } as VillageEvent));
        }
      } else {
        eventsWithAttendance = (data || []).map(event => ({
          ...event,
          attendees_count: Array.isArray(event.attendees_count) ? event.attendees_count[0]?.count || 0 : 0,
        } as VillageEvent));
      }

      setEvents(eventsWithAttendance);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create an event",
        variant: "destructive",
      });
      return;
    }

    if (!newEvent.title.trim() || !newEvent.event_date) {
      toast({
        title: "Required fields missing",
        description: "Please fill in the title and event date",
        variant: "destructive",
      });
      return;
    }

    try {
      const eventData = {
        village_id: villageId,
        organizer_id: user.id,
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || null,
        event_date: newEvent.event_date,
        end_date: newEvent.end_date || null,
        location: newEvent.location.trim() || null,
        event_type: newEvent.event_type,
        max_attendees: newEvent.max_attendees ? parseInt(newEvent.max_attendees) : null,
      };

      const { error } = await supabase
        .from('village_events')
        .insert([eventData]);

      if (error) throw error;

      setNewEvent({
        title: '',
        description: '',
        event_date: '',
        end_date: '',
        location: '',
        event_type: 'community',
        max_attendees: '',
      });
      setIsCreateOpen(false);
      fetchEvents();
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const updateAttendance = async (eventId: string, status: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to RSVP",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('event_attendees')
        .upsert([{
          event_id: eventId,
          user_id: user.id,
          attendance_status: status,
        }]);

      if (error) throw error;

      fetchEvents();
      toast({
        title: "Success",
        description: `RSVP updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive",
      });
    }
  };

  const getEventStatusColor = (event: VillageEvent) => {
    const eventDate = new Date(event.event_date);
    if (isPast(eventDate)) return 'bg-gray-100 text-gray-800';
    if (event.status === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      community: 'bg-blue-100 text-blue-800',
      cultural: 'bg-purple-100 text-purple-800',
      educational: 'bg-yellow-100 text-yellow-800',
      religious: 'bg-indigo-100 text-indigo-800',
      sports: 'bg-green-100 text-green-800',
      health: 'bg-red-100 text-red-800',
      development: 'bg-orange-100 text-orange-800',
      celebration: 'bg-pink-100 text-pink-800',
    };
    return colors[type] || colors.community;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Events ({events.length})</span>
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    placeholder="Event title..."
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Event Type</label>
                  <Select 
                    value={newEvent.event_type} 
                    onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Date & Time *</label>
                    <Input
                      type="datetime-local"
                      value={newEvent.event_date}
                      onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={newEvent.end_date}
                      onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    placeholder="Event location..."
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Attendees</label>
                  <Input
                    type="number"
                    placeholder="Optional limit..."
                    value={newEvent.max_attendees}
                    onChange={(e) => setNewEvent({ ...newEvent, max_attendees: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Event details..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={createEvent} className="flex-1">
                    Create Event
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'this_week', label: 'This Week' },
            { value: 'past', label: 'Past Events' },
            { value: 'all', label: 'All Events' },
          ].map((filterOption) => (
            <Button
              key={filterOption.value}
              variant={filter === filterOption.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterOption.value)}
            >
              {filterOption.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No events scheduled. Create the first one!</p>
          </div>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge className={getEventStatusColor(event)}>
                          {isPast(new Date(event.event_date)) ? 'Past' : event.status}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <Badge className={getEventTypeColor(event.event_type)}>
                      {eventTypes.find(t => t.value === event.event_type)?.label || event.event_type}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(event.event_date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(event.event_date), 'HH:mm')}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {event.attendees_count} attending
                        {event.max_attendees && ` (max ${event.max_attendees})`}
                      </span>
                    </div>

                    {isFuture(new Date(event.event_date)) && event.status !== 'cancelled' && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant={event.user_attendance === 'going' ? 'default' : 'outline'}
                          onClick={() => updateAttendance(event.id, 'going')}
                          className="h-8 px-3"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Going
                        </Button>
                        <Button
                          size="sm"
                          variant={event.user_attendance === 'maybe' ? 'default' : 'outline'}
                          onClick={() => updateAttendance(event.id, 'maybe')}
                          className="h-8 px-3"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Maybe
                        </Button>
                        <Button
                          size="sm"
                          variant={event.user_attendance === 'not_going' ? 'default' : 'outline'}
                          onClick={() => updateAttendance(event.id, 'not_going')}
                          className="h-8 px-3"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Can't Go
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};