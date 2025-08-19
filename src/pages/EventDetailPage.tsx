import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useEventSlug } from '@/hooks/useSlugResolver';
import { EntitySEO } from '@/components/SEO/EntitySEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Music, 
  Ticket,
  Share2,
  Heart,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

const EventDetailPage: React.FC = () => {
  const { entity: event, loading, error } = useEventSlug();

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="Loading event details..." />
        </div>
      </AppLayout>
    );
  }

  if (error || !event) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/events">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const eventDate = event.event_date ? parseISO(event.event_date) : null;
  const endDate = event.end_date ? parseISO(event.end_date) : null;

  return (
    <AppLayout>
      <EntitySEO 
        entity={event}
        entityType="event"
        isLoading={loading}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/events">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>

        {/* Event Header */}
        <Card className="mb-6">
          {event.flyer_url && (
            <div className="w-full h-64 md:h-80 relative overflow-hidden rounded-t-lg">
              <img
                src={event.flyer_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
                <div className="p-6 text-white">
                  <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{event.category}</Badge>
                    {event.genre && <Badge variant="outline">{event.genre}</Badge>}
                    <Badge className={event.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <CardHeader className={!event.flyer_url ? '' : 'pt-0'}>
            {!event.flyer_url && (
              <>
                <CardTitle className="text-3xl font-bold text-primary mb-2">
                  {event.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{event.category}</Badge>
                  {event.genre && <Badge variant="outline">{event.genre}</Badge>}
                  <Badge className={event.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {event.status}
                  </Badge>
                </div>
              </>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-muted-foreground">
              {eventDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(eventDate, 'PPP')}</span>
                </div>
              )}
              {eventDate && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{format(eventDate, 'p')}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.venue_name}, {event.venue_address}</span>
              </div>
              {event.max_attendees && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Max {event.max_attendees} attendees</span>
                </div>
              )}
              {event.age_restriction && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Age {event.age_restriction}+</span>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {event.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Event Features */}
            <Card>
              <CardHeader>
                <CardTitle>Event Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {event.has_livestream && (
                    <div className="flex items-center gap-2 text-green-600">
                      <ExternalLink className="h-4 w-4" />
                      <span>Live Stream Available</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    <span>{event.category}</span>
                  </div>
                  {event.genre && (
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      <span>{event.genre}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Venue Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Venue Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">{event.venue_name}</p>
                  <p className="text-muted-foreground">{event.venue_address}</p>
                  {event.venue_coordinates && (
                    <Button variant="outline" size="sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      View on Map
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.ticket_sale_deadline && (
                  <div className="text-sm text-muted-foreground">
                    <p>Ticket sales end: {format(parseISO(event.ticket_sale_deadline), 'PPP')}</p>
                  </div>
                )}
                <Button className="w-full">
                  <Ticket className="h-4 w-4 mr-2" />
                  Get Tickets
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Save Event
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Event
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Event Status */}
            {event.is_featured && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Featured Event</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default EventDetailPage;