import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Ticket, 
  Share2, 
  Heart,
  ExternalLink,
  User,
  Building
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { EventChatBox } from './EventChatBox';
import { EventRegistrationDialog } from './EventRegistrationDialog';

interface Event {
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
  ticket_types?: TicketType[];
  event_speakers?: Speaker[];
  event_agenda?: AgendaItem[];
}

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  max_quantity: number;
  sold_quantity: number;
  type: string;
}

interface Speaker {
  id: string;
  speaker_name: string;
  speaker_title?: string;
  speaker_bio?: string;
  speaker_image_url?: string;
}

interface AgendaItem {
  id: string;
  agenda_time: string;
  agenda_title: string;
  agenda_description?: string;
  duration_minutes: number;
}

interface EventDetailsDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRsvpUpdate?: () => void;
}

export const EventDetailsDialog: React.FC<EventDetailsDialogProps> = ({
  event,
  open,
  onOpenChange,
  onRsvpUpdate
}) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);

  if (!event) return null;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.name,
          text: event.short_description || event.description,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Event link copied to clipboard');
      }
      
      // Update share count
      await supabase
        .from('civic_events')
        .update({ share_count: event.share_count + 1 })
        .eq('id', event.id);
        
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like events');
      return;
    }
    
    setLiked(!liked);
    // Here you would implement like functionality
    toast.success(liked ? 'Removed from favorites' : 'Added to favorites');
  };

  const getLowestTicketPrice = () => {
    if (!event.ticket_types?.length) return null;
    const prices = event.ticket_types.map(t => t.price).filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  const getTotalTicketsAvailable = () => {
    if (!event.ticket_types?.length) return 0;
    return event.ticket_types.reduce((total, type) => 
      total + (type.max_quantity - type.sold_quantity), 0
    );
  };

  const hasTickets = event.ticket_types && event.ticket_types.length > 0;
  const lowestPrice = getLowestTicketPrice();
  const ticketsAvailable = getTotalTicketsAvailable();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">{event.name}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{event.event_type.replace('_', ' ')}</Badge>
                <Badge variant="outline">{event.organizer_type.replace('_', ' ')}</Badge>
                {event.is_civic_official && (
                  <Badge className="bg-blue-600 hover:bg-blue-700">Official</Badge>
                )}
                {event.organizer_verified && (
                  <Badge className="bg-green-600 hover:bg-green-700">Verified</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleLike}>
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cover Image */}
          {event.cover_image_url && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={event.cover_image_url}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Event Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">
                      {format(new Date(event.start_date), 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(event.start_date), 'h:mm a')}
                      {event.end_date && ` - ${format(new Date(event.end_date), 'h:mm a')}`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">{event.venue_name || 'Venue TBA'}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.venue_address || `${event.subregion}, ${event.region}`}
                    </div>
                  </div>
                </div>

                {event.max_attendees && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Capacity: {event.max_attendees}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.rsvp_count || 0} attendees registered
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tickets/RSVP Card */}
            <Card>
              <CardContent className="p-4">
                {hasTickets ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-primary" />
                      <span className="font-medium">Tickets Available</span>
                    </div>
                    
                    {lowestPrice && (
                      <div className="text-2xl font-bold text-primary">
                        From {lowestPrice.toLocaleString()} XAF
                      </div>
                    )}
                    
                    <div className="text-sm text-muted-foreground">
                      {ticketsAvailable > 0 ? (
                        `${ticketsAvailable} tickets remaining`
                      ) : (
                        <span className="text-red-500">Sold out</span>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full" 
                      disabled={ticketsAvailable === 0}
                      onClick={() => setShowRegistration(true)}
                    >
                      {ticketsAvailable > 0 ? 'Get Tickets' : 'Sold Out'}
                    </Button>
                  </div>
                ) : event.allow_rsvp ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="font-medium">Free Event</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      RSVP to let the organizer know you're coming
                    </div>
                    
                    <EventRegistrationDialog
                      event={{
                        id: event.id,
                        title: event.name,
                        event_date: event.start_date,
                        start_time: format(new Date(event.start_date), 'HH:mm'),
                        end_time: event.end_date ? format(new Date(event.end_date), 'HH:mm') : '',
                        location: event.venue_name || `${event.subregion}, ${event.region}`,
                        current_attendees: event.rsvp_count || 0,
                        max_attendees: event.max_attendees
                      }}
                      onRegistrationChange={onRsvpUpdate}
                    >
                      <Button className="w-full">RSVP Now</Button>
                    </EventRegistrationDialog>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-muted-foreground">
                      Registration not available for this event
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabs for additional content */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
              <TabsTrigger value="speakers">Speakers</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="space-y-4">
              <div className="prose max-w-none">
                <p>{event.description}</p>
              </div>
              
              {event.civic_tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.civic_tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tickets" className="space-y-4">
              {hasTickets ? (
                <div className="space-y-4">
                  {event.ticket_types?.map((ticket) => (
                    <Card key={ticket.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{ticket.name}</h4>
                            <p className="text-sm text-muted-foreground">{ticket.description}</p>
                            <div className="mt-2 text-sm">
                              Available: {ticket.max_quantity - ticket.sold_quantity} / {ticket.max_quantity}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {ticket.price.toLocaleString()} {ticket.currency}
                            </div>
                            <Badge variant="outline">{ticket.type.replace('_', ' ')}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No tickets required</h3>
                  <p className="text-muted-foreground">This is a free event</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="speakers" className="space-y-4">
              {event.event_speakers?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.event_speakers.map((speaker) => (
                    <Card key={speaker.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {speaker.speaker_image_url ? (
                            <img
                              src={speaker.speaker_image_url}
                              alt={speaker.speaker_name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium">{speaker.speaker_name}</h4>
                            {speaker.speaker_title && (
                              <p className="text-sm text-muted-foreground">{speaker.speaker_title}</p>
                            )}
                            {speaker.speaker_bio && (
                              <p className="text-sm mt-2">{speaker.speaker_bio}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No speakers announced</h3>
                  <p className="text-muted-foreground">Speaker information will be updated soon</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="agenda" className="space-y-4">
              {event.event_agenda?.length ? (
                <div className="space-y-4">
                  {event.event_agenda.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center gap-2 text-primary min-w-0">
                            <Clock className="w-4 h-4" />
                            <span className="font-mono text-sm">
                              {format(new Date(`2000-01-01T${item.agenda_time}`), 'HH:mm')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.agenda_title}</h4>
                            {item.agenda_description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.agenda_description}
                              </p>
                            )}
                            <div className="text-xs text-muted-foreground mt-2">
                              Duration: {item.duration_minutes} minutes
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No agenda available</h3>
                  <p className="text-muted-foreground">Event schedule will be updated soon</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Registration Dialog */}
        {showRegistration && hasTickets && (
          <EventRegistrationDialog
            event={{
              id: event.id,
              title: event.name,
              event_date: event.start_date,
              start_time: format(new Date(event.start_date), 'HH:mm'),
              end_time: event.end_date ? format(new Date(event.end_date), 'HH:mm') : '',
              location: event.venue_name || `${event.subregion}, ${event.region}`,
              current_attendees: event.rsvp_count || 0,
              max_attendees: event.max_attendees,
              registration_fee: lowestPrice
            }}
            onRegistrationChange={onRsvpUpdate}
          >
            <div /> {/* Hidden trigger */}
          </EventRegistrationDialog>
        )}
      </DialogContent>
    </Dialog>
  );
};