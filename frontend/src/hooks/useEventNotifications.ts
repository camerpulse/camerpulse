import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useEventNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to event notifications
    const channel = supabase
      .channel('event-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
        },
        (payload) => {
          const newEvent = payload.new as any;
          if (newEvent.is_featured) {
            toast({
              title: "New Featured Event",
              description: `${newEvent.title} - ${new Date(newEvent.event_date).toLocaleDateString()}`,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_live_updates',
        },
        async (payload) => {
          const update = payload.new as any;
          
          // Check if user is attending this event
          const { data: rsvp } = await supabase
            .from('event_rsvps')
            .select('*')
            .eq('event_id', update.event_id)
            .eq('user_id', user.id)
            .single();

          if (rsvp) {
            // Get event details
            const { data: event } = await supabase
              .from('events')
              .select('title')
              .eq('id', update.event_id)
              .single();

            toast({
              title: "Event Update",
              description: `${event?.title}: ${update.update_title}`,
            });
          }
        }
      )
      .subscribe();

    // Set up reminder notifications for upcoming events
    const checkUpcomingEvents = async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const { data: upcomingRSVPs } = await supabase
        .from('event_rsvps')
        .select(`
          *,
          events (
            id,
            title,
            event_date,
            start_time
          )
        `)
        .eq('user_id', user.id)
        .eq('rsvp_status', 'going')
        .gte('events.event_date', new Date().toISOString().split('T')[0])
        .lte('events.event_date', tomorrow.toISOString().split('T')[0]);

      upcomingRSVPs?.forEach((rsvp: any) => {
        toast({
          title: "Event Reminder",
          description: `${rsvp.events.title} is tomorrow at ${rsvp.events.start_time}`,
        });
      });
    };

    // Check for upcoming events on load
    checkUpcomingEvents();

    // Set up daily reminder check
    const reminderInterval = setInterval(checkUpcomingEvents, 24 * 60 * 60 * 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(reminderInterval);
    };
  }, [user]);
};