import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Users, 
  Video,
  MapPin,
  UserPlus,
  UserMinus,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiasporaProfile {
  id: string;
  full_name: string;
}

interface DiasporaEvent {
  id: string;
  event_name: string;
  event_type: string;
  event_description: string;
  target_audience: string[];
  event_date: string;
  duration_hours: number;
  is_virtual: boolean;
  meeting_link?: string;
  physical_location?: string;
  organizer_name: string;
  max_participants?: number;
  current_participants: number;
  registration_required: boolean;
  registration_deadline?: string;
  event_status: string;
}

interface EventRegistration {
  event_id: string;
  attendance_status: string;
}

interface DiasporaEventsProps {
  diasporaProfile: DiasporaProfile;
}

const EVENT_TYPES = {
  town_hall: 'Virtual Town Hall',
  summit: 'Civic Summit',
  roundtable: 'Roundtable Discussion',
  fundraiser: 'Fundraising Event',
  cultural: 'Cultural Event'
};

export const DiasporaEvents: React.FC<DiasporaEventsProps> = ({ diasporaProfile }) => {
  const { toast } = useToast();
  const [events, setEvents] = useState<DiasporaEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchEvents();
    fetchUserRegistrations();
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from('diaspora_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (activeTab === 'upcoming') {
        query = query.gte('event_date', new Date().toISOString());
      } else if (activeTab === 'past') {
        query = query.lt('event_date', new Date().toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('diaspora_event_registrations')
        .select('event_id, attendance_status')
        .eq('diaspora_id', diasporaProfile.id);

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleRegistration = async (eventId: string, action: 'register' | 'unregister') => {
    try {
      if (action === 'register') {
        const { error } = await supabase
          .from('diaspora_event_registrations')
          .insert([{
            event_id: eventId,
            diaspora_id: diasporaProfile.id,
            attendance_status: 'registered'
          }]);

        if (error) throw error;

        toast({
          title: "Registration Successful",
          description: "You have been registered for this event.",
        });
      } else {
        const { error } = await supabase
          .from('diaspora_event_registrations')
          .delete()
          .eq('event_id', eventId)
          .eq('diaspora_id', diasporaProfile.id);

        if (error) throw error;

        toast({
          title: "Unregistered",
          description: "You have been unregistered from this event.",
        });
      }

      fetchUserRegistrations();
      fetchEvents(); // Refresh to update participant counts
    } catch (error: any) {
      console.error('Error with registration:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update registration.",
        variant: "destructive",
      });
    }
  };

  const isRegistered = (eventId: string) => {
    return registrations.some(reg => reg.event_id === eventId);
  };

  const canRegister = (event: DiasporaEvent) => {
    if (!event.registration_required) return false;
    if (event.event_status !== 'upcoming') return false;
    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) return false;
    if (event.max_participants && event.current_participants >= event.max_participants) return false;
    return true;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'town_hall': return 'bg-blue-100 text-blue-800';
      case 'summit': return 'bg-purple-100 text-purple-800';
      case 'roundtable': return 'bg-green-100 text-green-800';
      case 'fundraiser': return 'bg-red-100 text-red-800';
      case 'cultural': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Diaspora Events & Community</h2>
        <p className="text-muted-foreground">
          Connect with fellow Cameroonians and participate in meaningful discussions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="my-events">My Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {events.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {activeTab === 'upcoming' ? 'No upcoming events available.' : 
                   activeTab === 'past' ? 'No past events found.' : 'You haven\'t registered for any events yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {events
                .filter(event => {
                  if (activeTab === 'my-events') {
                    return isRegistered(event.id);
                  }
                  return true;
                })
                .map(event => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{event.event_name}</h3>
                          <Badge className={getEventTypeColor(event.event_type)}>
                            {EVENT_TYPES[event.event_type as keyof typeof EVENT_TYPES] || event.event_type}
                          </Badge>
                          {isRegistered(event.id) && (
                            <Badge variant="outline">
                              <Star className="h-3 w-3 mr-1" />
                              Registered
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {event.event_description}
                        </p>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.event_date)} at {formatTime(event.event_date)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{event.duration_hours} hours</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {event.is_virtual ? (
                              <>
                                <Video className="h-4 w-4" />
                                <span>Virtual Event</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="h-4 w-4" />
                                <span>{event.physical_location}</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {event.current_participants} participants
                              {event.max_participants && ` (max ${event.max_participants})`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {event.organizer_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>Organized by {event.organizer_name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {event.registration_required && canRegister(event) && !isRegistered(event.id) && (
                          <Button 
                            size="sm"
                            onClick={() => handleRegistration(event.id, 'register')}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Register
                          </Button>
                        )}

                        {isRegistered(event.id) && event.event_status === 'upcoming' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRegistration(event.id, 'unregister')}
                          >
                            <UserMinus className="h-4 w-4 mr-1" />
                            Unregister
                          </Button>
                        )}

                        {event.is_virtual && event.meeting_link && isRegistered(event.id) && (
                          <Button size="sm" variant="secondary" asChild>
                            <a href={event.meeting_link} target="_blank" rel="noopener noreferrer">
                              <Video className="h-4 w-4 mr-1" />
                              Join Meeting
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    {event.registration_deadline && (
                      <div className="mt-4 p-3 bg-muted rounded text-sm">
                        <strong>Registration deadline:</strong> {formatDate(event.registration_deadline)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};