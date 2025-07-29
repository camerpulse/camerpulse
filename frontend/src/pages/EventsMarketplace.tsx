import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Users, Clock, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  venue_name: string;
  venue_address: string;
  flyer_url: string | null;
  category: string;
  genre: string | null;
  max_attendees: number | null;
  status: string;
  organizer_type: string;
  ticket_types: {
    id: string;
    name: string;
    price: number;
    currency: string;
    max_quantity: number;
    sold_quantity: number;
  }[];
}

const EventsMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');

  // Fetch approved events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events-marketplace', searchTerm, selectedCategory, selectedGenre],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          *,
          ticket_types:event_ticket_types(
            id,
            name,
            price,
            currency,
            max_quantity,
            sold_quantity
          )
        `)
        .eq('status', 'approved')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (selectedGenre !== 'all') {
        query = query.eq('genre', selectedGenre);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
    }
  });

  const categories = ['all', 'concert', 'festival', 'tour', 'album_listening', 'meet_greet', 'virtual'];
  const genres = ['all', 'afrobeats', 'makossa', 'bikutsi', 'hip_hop', 'rnb', 'gospel', 'traditional'];

  const getLowestPrice = (ticketTypes: Event['ticket_types']) => {
    if (!ticketTypes || ticketTypes.length === 0) return null;
    const prices = ticketTypes.map(t => t.price);
    return Math.min(...prices);
  };

  const getTicketsAvailable = (ticketTypes: Event['ticket_types']) => {
    if (!ticketTypes || ticketTypes.length === 0) return 0;
    return ticketTypes.reduce((total, type) => total + (type.max_quantity - type.sold_quantity), 0);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading events...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">CamerPulse Events</h1>
          <p className="text-lg text-muted-foreground">
            Discover and attend amazing events across Cameroon
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-2">
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later for new events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const lowestPrice = getLowestPrice(event.ticket_types);
              const ticketsAvailable = getTicketsAvailable(event.ticket_types);

              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <img
                      src={event.flyer_url || '/placeholder.svg'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary">
                        {event.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(event.event_date), 'PPP p')}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{event.venue_name}, {event.venue_address}</span>
                      </div>
                      {event.max_attendees && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Max {event.max_attendees} attendees
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm line-clamp-2">{event.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          {lowestPrice && (
                            <div className="text-lg font-bold">
                              From {lowestPrice.toLocaleString()} XAF
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            {ticketsAvailable > 0 ? (
                              `${ticketsAvailable} tickets available`
                            ) : (
                              <span className="text-red-500">Sold out</span>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          disabled={ticketsAvailable === 0}
                          onClick={() => {
                            // Navigate to event details/ticket purchase
                            console.log('Navigate to event:', event.id);
                          }}
                        >
                          {ticketsAvailable > 0 ? 'Get Tickets' : 'Sold Out'}
                        </Button>
                      </div>

                      {event.genre && (
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {event.genre}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default EventsMarketplace;