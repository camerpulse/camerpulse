import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Share2, Clock, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EventCard } from '@/components/events/EventCard';
import { EventFilter } from '@/components/events/EventFilter';
import { CreateEventDialog } from '@/components/events/CreateEventDialog';
import { useAuth } from '@/contexts/AuthContext';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

interface CivicEvent {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  start_date: string;
  end_date?: string;
  venue_name?: string;
  venue_address?: string;
  region: string;
  subregion?: string;
  cover_image_url?: string;
  event_type: string;
  organizer_type: string;
  organizer_verified: boolean;
  is_civic_official: boolean;
  max_attendees?: number;
  allow_rsvp: boolean;
  status: string;
  view_count: number;
  share_count: number;
  civic_tags: string[];
  created_at: string;
  created_by?: string;
  rsvp_count?: number;
}

interface EventFilters {
  region?: string;
  event_type?: 'civic' | 'campaign' | 'education' | 'protest' | 'music' | 'business' | 'youth' | 'community' | 'government' | 'religious';
  organizer_type?: 'verified_user' | 'government_institution' | 'political_party' | 'company' | 'school' | 'ngo' | 'artist' | 'event_organizer';
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed' | 'published' | 'postponed' | 'ongoing';
  date_range?: 'upcoming' | 'ongoing' | 'past' | 'all';
}

const Events = () => {
  const { user } = useAuth();
  useEventNotifications();
  const [events, setEvents] = useState<CivicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EventFilters>({ 
    status: 'published',
    date_range: 'upcoming' 
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('civic_events')
        .select(`
          *,
          event_rsvps(count)
        `);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.region) {
        query = query.eq('region', filters.region);
      }
      
      if (filters.event_type) {
        query = query.eq('event_type', filters.event_type);
      }
      
      if (filters.organizer_type) {
        query = query.eq('organizer_type', filters.organizer_type);
      }

      // Date filtering
      const now = new Date();
      if (filters.date_range === 'upcoming') {
        query = query.gte('start_date', now.toISOString());
      } else if (filters.date_range === 'past') {
        query = query.lt('start_date', now.toISOString());
      } else if (filters.date_range === 'ongoing') {
        query = query
          .lte('start_date', now.toISOString())
          .gte('end_date', now.toISOString());
      }

      query = query.order('start_date', { ascending: filters.date_range !== 'past' });

      const { data, error } = await query;

      if (error) throw error;

      // Process RSVP counts
      const eventsWithRsvpCount = data?.map(event => ({
        ...event,
        rsvp_count: event.event_rsvps?.[0]?.count || 0
      })) || [];

      setEvents(eventsWithRsvpCount);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const handleFilterChange = (newFilters: EventFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleEventCreated = () => {
    fetchEvents();
    setShowCreateDialog(false);
  };

  const eventsByTimeframe = {
    upcoming: events.filter(e => isAfter(new Date(e.start_date), new Date())),
    ongoing: events.filter(e => {
      const now = new Date();
      const start = new Date(e.start_date);
      const end = e.end_date ? new Date(e.end_date) : start;
      return isBefore(start, now) && isAfter(end, now);
    }),
    past: events.filter(e => isBefore(new Date(e.start_date), new Date()))
  };

  const featuredEvents = events.filter(e => e.is_civic_official || e.organizer_verified).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Civic Events</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover, organize, and participate in civic events across Cameroon
            </p>
            {user && (
              <Button onClick={() => setShowCreateDialog(true)} className="mt-6">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <EventFilter 
              filters={filters} 
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Featured Events */}
            {featuredEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary">Featured</Badge>
                    Official & Verified Events
                  </CardTitle>
                  <CardDescription>
                    High-impact civic events from verified organizers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredEvents.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        onRsvpUpdate={fetchEvents}
                        variant="featured"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {eventsByTimeframe.upcoming.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Upcoming</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {eventsByTimeframe.ongoing.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Ongoing</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {events.filter(e => e.is_civic_official).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Official</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {events.reduce((sum, e) => sum + (e.rsvp_count || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total RSVPs</div>
                </CardContent>
              </Card>
            </div>

            {/* Events List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  All Events
                  <Badge variant="outline">
                    {events.length} events
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading events...</p>
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No events found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or check back later
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        onRsvpUpdate={fetchEvents}
                        variant="list"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Event Dialog */}
      <CreateEventDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default Events;