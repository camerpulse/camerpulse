import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Globe,
  Video,
  UserPlus,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type DiasporaEvent = Database['public']['Tables']['diaspora_events']['Row'];
type EventRegistration = Database['public']['Tables']['diaspora_event_registrations']['Row'];
type DiasporaProfile = Database['public']['Tables']['diaspora_profiles']['Row'];

export const DiasporaEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<DiasporaEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [diasporaProfile, setDiasporaProfile] = useState<DiasporaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    fetchData();
  }, [user, filter]);

  const fetchData = async () => {
    try {
      // Fetch diaspora profile
      if (user) {
        const { data: profileData } = await supabase
          .from('diaspora_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profileData) {
          setDiasporaProfile(profileData);

          // Fetch user's event registrations
          const { data: registrationsData } = await supabase
            .from('diaspora_event_registrations')
            .select('*')
            .eq('diaspora_profile_id', profileData.id);
          
          if (registrationsData) {
            setRegistrations(registrationsData);
          }
        }
      }

      // Fetch events based on filter
      let query = supabase
        .from('diaspora_events')
        .select('*')
        .eq('event_status', 'active')
        .order('event_date', { ascending: true });

      const now = new Date().toISOString();
      
      if (filter === 'upcoming') {
        query = query.gte('event_date', now);
      } else if (filter === 'past') {
        query = query.lt('event_date', now);
      }

      const { data: eventsData } = await query;
      
      if (eventsData) {
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event: DiasporaEvent) => {
    if (!diasporaProfile) {
      toast({
        title: "Profile Required",
        description: "Please create your diaspora profile first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if already registered
      const existingRegistration = registrations.find(
        reg => reg.event_id === event.id && reg.diaspora_profile_id === diasporaProfile.id
      );

      if (existingRegistration) {
        toast({
          title: "Already Registered",
          description: "You are already registered for this event.",
          variant: "destructive"
        });
        return;
      }

      // Register for event
      const { error } = await supabase
        .from('diaspora_event_registrations')
        .insert({
          diaspora_profile_id: diasporaProfile.id,
          event_id: event.id,
          registration_status: 'confirmed'
        });

      if (error) throw error;

      toast({
        title: "Registration Successful",
        description: "You have been registered for this event!",
      });

      // Refresh registrations
      fetchData();

    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register for the event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isRegistered = (eventId: string) => {
    return registrations.some(reg => reg.event_id === eventId);
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'virtual_townhall':
        return <Video className="h-4 w-4" />;
      case 'cultural_event':
        return <Users className="h-4 w-4" />;
      case 'networking':
        return <Globe className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeBadge = (eventType: string) => {
    switch (eventType) {
      case 'virtual_townhall':
        return 'Virtual Townhall';
      case 'cultural_event':
        return 'Cultural Event';
      case 'networking':
        return 'Networking';
      case 'educational':
        return 'Educational';
      default:
        return 'General';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Diaspora Events
          </h1>
          <p className="text-muted-foreground">
            Participate in virtual townhalls, cultural events, and networking opportunities
          </p>
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
            <TabsTrigger value="my-events">My Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card key={event.id} className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {getEventTypeIcon(event.event_type)}
                          {getEventTypeBadge(event.event_type)}
                        </Badge>
                        <Badge variant={isRegistered(event.id) ? 'default' : 'outline'}>
                          {isRegistered(event.id) ? 'Registered' : 'Open'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.event_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {new Date(event.event_date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} ({event.duration_minutes} minutes)
                        </div>
                        {event.max_attendees && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Max {event.max_attendees} attendees
                          </div>
                        )}
                      </div>

                      {event.languages && event.languages.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {event.languages.map((language) => (
                            <Badge key={language} variant="outline" className="text-xs">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Button 
                        className="w-full" 
                        onClick={() => handleRegister(event)}
                        disabled={isRegistered(event.id) || event.event_status !== 'active'}
                      >
                        {isRegistered(event.id) ? (
                          <>
                            <Users className="h-4 w-4 mr-2" />
                            Registered
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Register
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Upcoming Events</h3>
                  <p className="text-muted-foreground">
                    Check back later for new events and opportunities to connect with the diaspora community.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Past Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Past events will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-events">
            <Card>
              <CardHeader>
                <CardTitle>My Registered Events</CardTitle>
              </CardHeader>
              <CardContent>
                {registrations.length > 0 ? (
                  <p className="text-muted-foreground">
                    You are registered for {registrations.length} event(s).
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    You haven't registered for any events yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};