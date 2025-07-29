import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Clock, Users, Ticket, 
  ArrowLeft, Share2, Heart, ExternalLink,
  Music, Award, Star, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CamerPlayEvents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (filter === 'upcoming') {
        query = query.gte('start_date', new Date().toISOString());
      } else if (filter === 'past') {
        query = query.lt('start_date', new Date().toISOString());
      }

      const { data } = await query.limit(12);
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketPurchase = (event) => {
    toast({
      title: "Redirecting to Tickets",
      description: `Getting tickets for ${event.title}`,
    });
    // Navigate to ticket purchase page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-accent to-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/camerplay')}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CamerPlay
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <Calendar className="h-12 w-12" />
            <div>
              <h1 className="text-5xl font-black">Events</h1>
              <p className="text-xl opacity-90">Live Music & Entertainment</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={() => setFilter('upcoming')}
              className={filter === 'upcoming' ? 'bg-white text-black' : 'bg-white/20 text-white'}
            >
              Upcoming Events
            </Button>
            <Button 
              onClick={() => setFilter('past')}
              className={filter === 'past' ? 'bg-white text-black' : 'bg-white/20 text-white'}
            >
              Past Events
            </Button>
            <Button 
              onClick={() => navigate('/camerplay/events/create')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Create Event
            </Button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'upcoming' ? 'No upcoming events at the moment' : 'No past events to display'}
            </p>
            <Button onClick={() => navigate('/camerplay/events/create')}>
              Create First Event
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Card key={event.id} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400"
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    alt={event.title}
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-white">
                      {new Date(event.start_date) > new Date() ? 'Upcoming' : 'Past'}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(event.start_date).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location || 'Location TBA'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{Math.floor(Math.random() * 200) + 50} attending</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleTicketPurchase(event)}
                      disabled={new Date(event.start_date) < new Date()}
                    >
                      <Ticket className="h-4 w-4 mr-2" />
                      {new Date(event.start_date) > new Date() ? 'Get Tickets' : 'Event Ended'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Featured Artists Section */}
      <div className="bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Event Artists</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="text-center hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarImage src={`https://images.unsplash.com/photo-150${i}003211169-0a1dd7228f2d?w=100`} />
                    <AvatarFallback>A{i}</AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold text-sm">Artist {i}</h4>
                  <p className="text-xs text-muted-foreground">Genre</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CamerPlayEvents;